/**
 * Provider-specific inbound routes: accept provider JSON, map to canonical, create WO.
 * POST /v1/inbound/oem_mock – mock OEM payload → canonical → createWorkOrder
 */

const { createLogger } = require('@tgnd/logger');
const { createWorkOrder } = require('../db');
const { mapOemMockToCanonical } = require('@tgnd/inbound-adapters');

const log = createLogger('api');

/** POST /v1/inbound/oem_mock – provider-specific OEM mock body → map → create */
async function postInboundOemMock(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};

  const result = mapOemMockToCanonical(body);
  if (result.error) {
    reqLog.warn('OEM mock mapping validation failed', 'WO_VALIDATION_FAILED', {
      provider_key: 'oem_mock',
      reason: result.error,
    });
    return res.status(400).json({ error: result.error, code: 'WO_VALIDATION_FAILED' });
  }

  try {
    const wo = await createWorkOrder(reqLog, {
      ...result.canonical,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created via inbound oem_mock', null, {
      id: wo.id,
      external_id: wo.external_id,
      status: wo.status,
    });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Work order create failed (inbound oem_mock)', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

module.exports = {
  postInboundOemMock,
};
