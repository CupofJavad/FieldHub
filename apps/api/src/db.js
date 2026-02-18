/**
 * TGND API – DB pool and work order queries.
 * Requires DATABASE_URL in env. Idempotency: (provider_key, external_id).
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

function rowToWorkOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    external_id: row.external_id,
    provider_key: row.provider_key,
    payer_type: row.payer_type,
    service_type: row.service_type,
    status: row.status,
    product: row.product || {},
    problem: row.problem,
    instructions: row.instructions,
    ship_to: row.ship_to || {},
    requested_date_start: row.requested_date_start,
    requested_date_end: row.requested_date_end,
    appointment_date: row.appointment_date,
    parts: row.parts || [],
    pricing: row.pricing || {},
    metadata: row.metadata || {},
    platform_job_id: row.platform_job_id ?? null,
    platform_type: row.platform_type ?? null,
    completion_payload: row.completion_payload ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function createWorkOrder(logger, data) {
  const client = await pool.connect();
  try {
    const q = `
      INSERT INTO work_orders (
        external_id, provider_key, payer_type, service_type, status,
        product, problem, instructions, ship_to,
        requested_date_start, requested_date_end, appointment_date,
        parts, pricing, metadata, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (provider_key, external_id) DO UPDATE SET
        updated_at = now(),
        status = COALESCE(EXCLUDED.status, work_orders.status),
        product = COALESCE(NULLIF(EXCLUDED.product::text, '{}'), work_orders.product),
        problem = COALESCE(NULLIF(EXCLUDED.problem, ''), work_orders.problem),
        instructions = COALESCE(NULLIF(EXCLUDED.instructions, ''), work_orders.instructions),
        ship_to = COALESCE(NULLIF(EXCLUDED.ship_to::text, '{}'), work_orders.ship_to),
        requested_date_start = COALESCE(EXCLUDED.requested_date_start, work_orders.requested_date_start),
        requested_date_end = COALESCE(EXCLUDED.requested_date_end, work_orders.requested_date_end),
        appointment_date = COALESCE(EXCLUDED.appointment_date, work_orders.appointment_date),
        parts = COALESCE(NULLIF(EXCLUDED.parts::text, '[]'), work_orders.parts),
        pricing = COALESCE(NULLIF(EXCLUDED.pricing::text, '{}'), work_orders.pricing),
        metadata = COALESCE(NULLIF(EXCLUDED.metadata::text, '{}'), work_orders.metadata)
      RETURNING *
    `;
    const values = [
      data.external_id,
      data.provider_key,
      data.payer_type,
      data.service_type,
      data.status || 'received',
      JSON.stringify(data.product || {}),
      data.problem ?? null,
      data.instructions ?? null,
      JSON.stringify(data.ship_to || {}),
      data.requested_date_start ?? null,
      data.requested_date_end ?? null,
      data.appointment_date ?? null,
      JSON.stringify(data.parts || []),
      JSON.stringify(data.pricing || {}),
      JSON.stringify(data.metadata || {}),
      data.idempotency_key ?? null,
    ];
    const res = await client.query(q, values);
    return rowToWorkOrder(res.rows[0]);
  } finally {
    client.release();
  }
}

async function getWorkOrderById(id) {
  const res = await pool.query(
    'SELECT * FROM work_orders WHERE id = $1',
    [id]
  );
  return rowToWorkOrder(res.rows[0]);
}

async function getWorkOrderByProviderAndExternal(provider_key, external_id) {
  const res = await pool.query(
    'SELECT * FROM work_orders WHERE provider_key = $1 AND external_id = $2',
    [provider_key, external_id]
  );
  return rowToWorkOrder(res.rows[0]);
}

async function getWorkOrderByPlatformJobId(platform_job_id) {
  const res = await pool.query(
    'SELECT * FROM work_orders WHERE platform_job_id = $1',
    [platform_job_id]
  );
  return rowToWorkOrder(res.rows[0]);
}

/**
 * List work orders with optional filters (for Report Center and export).
 * @param {{ status?: string, provider_key?: string, service_type?: string, platform_type?: string, date_from?: string, date_to?: string }} filters
 * @returns {Promise<object[]>}
 */
async function listWorkOrders(filters = {}) {
  const conditions = [];
  const values = [];
  let i = 1;
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      conditions.push(`status = ANY($${i++}::text[])`);
      values.push(filters.status);
    } else {
      conditions.push(`status = $${i++}`);
      values.push(filters.status);
    }
  }
  if (filters.provider_key) {
    conditions.push(`provider_key = $${i++}`);
    values.push(filters.provider_key);
  }
  if (filters.service_type) {
    conditions.push(`service_type = $${i++}`);
    values.push(filters.service_type);
  }
  if (filters.platform_type) {
    conditions.push(`platform_type = $${i++}`);
    values.push(filters.platform_type);
  }
  if (filters.date_from) {
    conditions.push(`created_at >= $${i++}::timestamptz`);
    values.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`created_at <= $${i++}::timestamptz`);
    values.push(filters.date_to);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const q = `SELECT * FROM work_orders ${where} ORDER BY created_at DESC`;
  const res = await pool.query(q, values);
  return res.rows.map(rowToWorkOrder);
}

/** WOs ready to assign: status in (scheduling, parts_shipped) and no platform_job_id. For unified pool view (M4.2). */
async function listAssignableWorkOrders(filters = {}) {
  const conditions = ["status IN ('scheduling', 'parts_shipped')", 'platform_job_id IS NULL'];
  const values = [];
  let i = 1;
  if (filters.provider_key) {
    conditions.push(`provider_key = $${i++}`);
    values.push(filters.provider_key);
  }
  if (filters.service_type) {
    conditions.push(`service_type = $${i++}`);
    values.push(filters.service_type);
  }
  if (filters.date_from) {
    conditions.push(`created_at >= $${i++}::timestamptz`);
    values.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`created_at <= $${i++}::timestamptz`);
    values.push(filters.date_to);
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const q = `SELECT * FROM work_orders ${where} ORDER BY created_at DESC`;
  const res = await pool.query(q, values);
  return res.rows.map(rowToWorkOrder);
}

const ALLOWED_PATCH_FIELDS = ['status', 'appointment_date', 'product', 'ship_to', 'parts', 'pricing', 'metadata', 'platform_job_id', 'platform_type', 'completion_payload'];

async function updateWorkOrder(id, updates) {
  const client = await pool.connect();
  try {
    const setClauses = ['updated_at = now()'];
    const values = [];
    let i = 1;
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (updates[key] === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(['product', 'ship_to', 'parts', 'pricing', 'metadata', 'completion_payload'].includes(key)
        ? JSON.stringify(updates[key])
        : updates[key]);
    }
    if (values.length === 0) {
      const row = await getWorkOrderById(id);
      return row;
    }
    values.push(id);
    const res = await client.query(
      `UPDATE work_orders SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rowToWorkOrder(res.rows[0]);
  } finally {
    client.release();
  }
}

async function getServiceTypeConfig(service_type) {
  const res = await pool.query(
    'SELECT * FROM service_type_config WHERE service_type = $1',
    [service_type]
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    service_type: row.service_type,
    description: row.description,
    required_statuses: row.required_statuses || [],
    required_completion_fields: row.required_completion_fields || [],
  };
}

async function getAllServiceTypeConfigs() {
  const res = await pool.query(
    'SELECT service_type, description, required_statuses, required_completion_fields FROM service_type_config ORDER BY service_type'
  );
  return res.rows.map(row => ({
    service_type: row.service_type,
    description: row.description,
    required_statuses: row.required_statuses || [],
    required_completion_fields: row.required_completion_fields || [],
  }));
}

async function runMigration() {
  const migrationsDir = path.join(__dirname, '../../../db/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
  }
}

function rowToClaim(row) {
  if (!row) return null;
  return {
    id: row.id,
    work_order_id: row.work_order_id,
    claim_type: row.claim_type,
    status: row.status,
    proposed_claim: row.proposed_claim || null,
    deductions: row.deductions || [],
    submitted_at: row.submitted_at,
    provider_response: row.provider_response || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getClaimByWorkOrderId(work_order_id) {
  const res = await pool.query('SELECT * FROM claims WHERE work_order_id = $1', [work_order_id]);
  return rowToClaim(res.rows[0]);
}

async function upsertClaim(data) {
  const res = await pool.query(
    `INSERT INTO claims (work_order_id, claim_type, status, proposed_claim, deductions, submitted_at, provider_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (work_order_id) DO UPDATE SET
       claim_type = EXCLUDED.claim_type,
       status = EXCLUDED.status,
       proposed_claim = EXCLUDED.proposed_claim,
       deductions = EXCLUDED.deductions,
       submitted_at = COALESCE(EXCLUDED.submitted_at, claims.submitted_at),
       provider_response = COALESCE(EXCLUDED.provider_response, claims.provider_response),
       updated_at = now()
     RETURNING *`,
    [
      data.work_order_id,
      data.claim_type,
      data.status,
      JSON.stringify(data.proposed_claim || null),
      JSON.stringify(data.deductions || []),
      data.submitted_at || null,
      data.provider_response ? JSON.stringify(data.provider_response) : null,
    ]
  );
  return rowToClaim(res.rows[0]);
}

async function updateClaimStatus(work_order_id, status, provider_response = null) {
  const res = await pool.query(
    `UPDATE claims SET status = $1, updated_at = now(),
     provider_response = COALESCE($2::jsonb, provider_response),
     submitted_at = CASE WHEN $1 = 'submitted' AND submitted_at IS NULL THEN now() ELSE submitted_at END
     WHERE work_order_id = $3 RETURNING *`,
    [status, provider_response ? JSON.stringify(provider_response) : null, work_order_id]
  );
  return rowToClaim(res.rows[0]);
}

/** M4.4 – Write audit entry for critical actions. */
async function insertAuditLog(entry) {
  await pool.query(
    `INSERT INTO audit_log (action, resource, resource_id, actor, details, request_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      entry.action || 'unknown',
      entry.resource || 'unknown',
      entry.resource_id ?? null,
      entry.actor ?? null,
      JSON.stringify(entry.details || {}),
      entry.request_id ?? null,
    ]
  );
}

module.exports = {
  pool,
  insertAuditLog,
  createWorkOrder,
  getWorkOrderById,
  getWorkOrderByProviderAndExternal,
  getWorkOrderByPlatformJobId,
  updateWorkOrder,
  listWorkOrders,
  listAssignableWorkOrders,
  getServiceTypeConfig,
  getAllServiceTypeConfigs,
  getClaimByWorkOrderId,
  upsertClaim,
  updateClaimStatus,
  runMigration,
};
