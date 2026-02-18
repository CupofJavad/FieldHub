/**
 * POST/GET/PATCH /v1/work-orders – canonical model, idempotency by provider_key + external_id
 */

const { createLogger } = require('@tgnd/logger');
const {
  createWorkOrder,
  getWorkOrderById,
  getWorkOrderByProviderAndExternal,
  updateWorkOrder,
  listWorkOrders,
  getServiceTypeConfig,
} = require('../db');
const { PAYER_TYPES, SERVICE_TYPES, WO_STATUS, canTransition } = require('@tgnd/canonical-model');
const { createWorkMarketAdapter, createFieldNationAdapter } = require('@tgnd/outbound-adapters');
const { validateCompletion } = require('../service-type-engine');

const log = createLogger('api');

function validatePayerType(v) {
  if (!v || !PAYER_TYPES.includes(v)) {
    return { valid: false, message: `payer_type must be one of: ${PAYER_TYPES.join(', ')}` };
  }
  return { valid: true };
}

function validateServiceType(v) {
  if (!v || !SERVICE_TYPES.includes(v)) {
    return { valid: false, message: `service_type must be one of: ${SERVICE_TYPES.join(', ')}` };
  }
  return { valid: true };
}

function validateStatus(v) {
  if (!v || !WO_STATUS.includes(v)) {
    return { valid: false, message: `status must be one of: ${WO_STATUS.join(', ')}` };
  }
  return { valid: true };
}

function validateCreateBody(body) {
  if (!body.external_id || typeof body.external_id !== 'string') {
    return { valid: false, message: 'external_id is required (string)' };
  }
  if (!body.provider_key || typeof body.provider_key !== 'string') {
    return { valid: false, message: 'provider_key is required (string)' };
  }
  const pt = validatePayerType(body.payer_type);
  if (!pt.valid) return pt;
  const st = validateServiceType(body.service_type);
  if (!st.valid) return st;
  if (body.status) {
    const s = validateStatus(body.status);
    if (!s.valid) return s;
  }
  return { valid: true };
}

/** POST /v1/work-orders – create or upsert (idempotent by provider_key + external_id) */
async function postWorkOrder(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};
  const validation = validateCreateBody(body);
  if (!validation.valid) {
    reqLog.warn('Work order validation failed', 'WO_VALIDATION_FAILED', { reason: validation.message });
    return res.status(400).json({ error: validation.message, code: 'WO_VALIDATION_FAILED' });
  }
  try {
    const wo = await createWorkOrder(reqLog, {
      external_id: body.external_id,
      provider_key: body.provider_key,
      payer_type: body.payer_type,
      service_type: body.service_type,
      status: body.status || 'received',
      product: body.product,
      problem: body.problem,
      instructions: body.instructions,
      ship_to: body.ship_to,
      requested_date_start: body.requested_date_start,
      requested_date_end: body.requested_date_end,
      appointment_date: body.appointment_date,
      parts: body.parts,
      pricing: body.pricing,
      metadata: body.metadata,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created/upserted', null, { id: wo.id, external_id: wo.external_id, status: wo.status });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Work order create failed', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

/** GET /v1/work-orders/:id or GET /v1/work-orders?provider=&external_id= or GET /v1/work-orders?status=&provider_key=&service_type= (list) */
async function getWorkOrder(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const { id } = req.params;
  const { provider: provider_key, external_id, status, provider_key: qProvider, service_type, date_from, date_to } = req.query;
  const provider = provider_key || qProvider;
  if (id) {
    const wo = await getWorkOrderById(id);
    if (!wo) {
      return res.status(404).json({ error: 'Work order not found', code: 'WO_NOT_FOUND' });
    }
    return res.json(wo);
  }
  if (provider && external_id) {
    const wo = await getWorkOrderByProviderAndExternal(provider, external_id);
    if (!wo) {
      return res.status(404).json({ error: 'Work order not found', code: 'WO_NOT_FOUND' });
    }
    return res.json(wo);
  }
  const filters = {};
  if (status) filters.status = status;
  if (provider) filters.provider_key = provider;
  if (service_type) filters.service_type = service_type;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;
  const work_orders = await listWorkOrders(filters);
  return res.json({ work_orders });
}

/** PATCH /v1/work-orders/:id – status and optional field updates; lifecycle enforced */
async function patchWorkOrder(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const { id } = req.params;
  const body = req.body || {};
  const wo = await getWorkOrderById(id);
  if (!wo) {
    return res.status(404).json({ error: 'Work order not found', code: 'WO_NOT_FOUND' });
  }
  if (body.status !== undefined) {
    const st = validateStatus(body.status);
    if (!st.valid) {
      return res.status(400).json({ error: st.message, code: 'WO_VALIDATION_FAILED' });
    }
    if (!canTransition(wo.status, body.status)) {
      return res.status(409).json({
        error: `Invalid transition from ${wo.status} to ${body.status}`,
        code: 'WO_LIFECYCLE_INVALID',
      });
    }
    // M2.1: completion validation – when transitioning to completed, require fields per service_type_config
    if (body.status === 'completed') {
      const config = await getServiceTypeConfig(wo.service_type);
      const patchPreview = { ...wo };
      if (body.completion_payload !== undefined) patchPreview.completion_payload = body.completion_payload;
      const validation = validateCompletion(patchPreview, config || {});
      if (!validation.valid) {
        reqLog.warn('Completion validation failed', 'WO_COMPLETION_VALIDATION_FAILED', { reason: validation.message });
        return res.status(400).json({ error: validation.message, code: 'WO_COMPLETION_VALIDATION_FAILED' });
      }
    }
  }
  try {
    const patch = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.appointment_date !== undefined) patch.appointment_date = body.appointment_date;
    if (body.product !== undefined) patch.product = body.product;
    if (body.ship_to !== undefined) patch.ship_to = body.ship_to;
    if (body.parts !== undefined) patch.parts = body.parts;
    if (body.pricing !== undefined) patch.pricing = body.pricing;
    if (body.metadata !== undefined) patch.metadata = body.metadata;
    if (body.platform_job_id !== undefined) patch.platform_job_id = body.platform_job_id;
    if (body.platform_type !== undefined) patch.platform_type = body.platform_type;
    if (body.completion_payload !== undefined) patch.completion_payload = body.completion_payload;
    const updated = await updateWorkOrder(id, patch);
    reqLog.info('Work order updated', null, { id: updated.id, status: updated.status });
    return res.json(updated);
  } catch (err) {
    reqLog.error('Work order update failed', 'WO_UPDATE_FAILED', err);
    return res.status(500).json({ error: 'Work order update failed', code: 'WO_UPDATE_FAILED' });
  }
}

const ASSIGNABLE_STATUSES = ['scheduling', 'parts_shipped'];
const ALLOWED_PLATFORM_TYPES = ['workmarket', 'fieldnation'];

/** POST /v1/work-orders/:id/assign – push WO to field platform, set status=assigned, platform_job_id, platform_type.
 *  Optional: ?platform_type=workmarket|fieldnation or body { platform_type }. Default: workmarket. */
async function postAssign(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const { id } = req.params;
  const platformType = (req.query.platform_type || req.body?.platform_type || 'workmarket').toLowerCase();
  if (!ALLOWED_PLATFORM_TYPES.includes(platformType)) {
    return res.status(400).json({
      error: `platform_type must be one of: ${ALLOWED_PLATFORM_TYPES.join(', ')}`,
      code: 'WO_ASSIGN_BAD_PLATFORM',
    });
  }
  const wo = await getWorkOrderById(id);
  if (!wo) {
    return res.status(404).json({ error: 'Work order not found', code: 'WO_NOT_FOUND' });
  }
  if (!ASSIGNABLE_STATUSES.includes(wo.status)) {
    return res.status(409).json({
      error: `WO must be in status scheduling or parts_shipped to assign; current: ${wo.status}`,
      code: 'WO_ASSIGN_INVALID_STATUS',
    });
  }
  if (wo.platform_job_id) {
    return res.status(409).json({
      error: 'Work order already assigned to a platform',
      code: 'WO_ALREADY_ASSIGNED',
    });
  }
  const logger = (lvl, msg, ctx) => reqLog[lvl](msg, null, ctx);
  const adapter = platformType === 'fieldnation'
    ? createFieldNationAdapter({ logger })
    : createWorkMarketAdapter({ logger });
  try {
    const result = await adapter.push(wo);
    const updated = await updateWorkOrder(id, {
      status: 'assigned',
      platform_job_id: result.platform_job_id,
      platform_type: result.platform_type,
    });
    reqLog.info('Work order assigned to platform', null, { id: updated.id, platform_job_id: result.platform_job_id, platform_type: result.platform_type });
    return res.json(updated);
  } catch (err) {
    reqLog.error('Assign to platform failed', 'WO_ASSIGN_FAILED', err);
    return res.status(500).json({ error: 'Assign to platform failed', code: 'WO_ASSIGN_FAILED' });
  }
}

/** GET /v1/work-orders/export?format=csv&provider_key=&status=&date_from=&date_to= – CSV/Excel for billing and claims (M2.5) */
async function getExport(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const { format = 'csv', provider_key, status, date_from, date_to } = req.query;
  const filters = {};
  if (provider_key) filters.provider_key = provider_key;
  if (status) filters.status = status;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;
  const work_orders = await listWorkOrders(filters);
  if (format === 'csv') {
    const header = 'id,external_id,provider_key,status,service_type,ship_to_address,appointment_date,platform_job_id,platform_type,completed_at,created_at,updated_at';
    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = work_orders.map((wo) => {
      const shipTo = wo.ship_to && typeof wo.ship_to === 'object' ? (wo.ship_to.address_line1 || wo.ship_to.street || '') : '';
      const completed_at = wo.status === 'completed' && wo.updated_at ? wo.updated_at : '';
      return [
        wo.id,
        wo.external_id,
        wo.provider_key,
        wo.status,
        wo.service_type,
        shipTo,
        wo.appointment_date || '',
        wo.platform_job_id || '',
        wo.platform_type || '',
        completed_at,
        wo.created_at || '',
        wo.updated_at || '',
      ].map(escape).join(',');
    });
    const csv = [header, ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="work-orders-export.csv"');
    return res.send(csv);
  }
  if (format === 'json') {
    return res.json({ work_orders });
  }
  return res.status(400).json({ error: 'format must be csv or json', code: 'EXPORT_BAD_FORMAT' });
}

module.exports = {
  postWorkOrder,
  getWorkOrder,
  patchWorkOrder,
  postAssign,
  getExport,
};
