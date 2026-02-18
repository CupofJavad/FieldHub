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
 * @param {{ status?: string, provider_key?: string, service_type?: string, date_from?: string, date_to?: string }} filters
 * @returns {Promise<object[]>}
 */
async function listWorkOrders(filters = {}) {
  const conditions = [];
  const values = [];
  let i = 1;
  if (filters.status) {
    conditions.push(`status = $${i++}`);
    values.push(filters.status);
  }
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
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
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

module.exports = {
  pool,
  createWorkOrder,
  getWorkOrderById,
  getWorkOrderByProviderAndExternal,
  getWorkOrderByPlatformJobId,
  updateWorkOrder,
  listWorkOrders,
  getServiceTypeConfig,
  getAllServiceTypeConfigs,
  runMigration,
};
