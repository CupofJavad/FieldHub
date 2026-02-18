/**
 * Provider-specific inbound routes: accept provider JSON, map to canonical, create WO.
 * POST /v1/inbound/oem_mock – mock OEM payload → canonical → createWorkOrder
 */

const { createLogger } = require('@tgnd/logger');
const { createWorkOrder } = require('../db');
const {
  mapOemMockToCanonical,
  mapExtWarrantyNewToCanonical,
  mapCustomerPayToCanonical,
  mapOemVizioToCanonical,
} = require('@tgnd/inbound-adapters');

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

/** POST /v1/inbound/ext_warranty_new – extended-warranty (NEW-style) body → map → create */
async function postInboundExtWarrantyNew(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};

  const result = mapExtWarrantyNewToCanonical(body);
  if (result.error) {
    reqLog.warn('Ext warranty new mapping validation failed', 'WO_VALIDATION_FAILED', {
      provider_key: 'ext_warranty_new',
      reason: result.error,
    });
    return res.status(400).json({ error: result.error, code: 'WO_VALIDATION_FAILED' });
  }

  try {
    const wo = await createWorkOrder(reqLog, {
      ...result.canonical,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created via inbound ext_warranty_new', null, {
      id: wo.id,
      external_id: wo.external_id,
      status: wo.status,
    });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Work order create failed (inbound ext_warranty_new)', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

/** POST /v1/inbound/customer_pay – customer-pay (out-of-warranty) body → map → create */
async function postInboundCustomerPay(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};

  const result = mapCustomerPayToCanonical(body);
  if (result.error) {
    reqLog.warn('Customer pay mapping validation failed', 'WO_VALIDATION_FAILED', {
      provider_key: 'customer_pay',
      reason: result.error,
    });
    return res.status(400).json({ error: result.error, code: 'WO_VALIDATION_FAILED' });
  }

  try {
    const wo = await createWorkOrder(reqLog, {
      ...result.canonical,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created via inbound customer_pay', null, {
      id: wo.id,
      external_id: wo.external_id,
      status: wo.status,
    });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Work order create failed (inbound customer_pay)', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

/** POST /v1/inbound/oem_vizio – VIZIO/TPV-style OEM body → map → create */
async function postInboundOemVizio(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};

  const result = mapOemVizioToCanonical(body);
  if (result.error) {
    reqLog.warn('OEM VIZIO mapping validation failed', 'WO_VALIDATION_FAILED', {
      provider_key: 'oem_vizio',
      reason: result.error,
    });
    return res.status(400).json({ error: result.error, code: 'WO_VALIDATION_FAILED' });
  }

  try {
    const wo = await createWorkOrder(reqLog, {
      ...result.canonical,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created via inbound oem_vizio', null, {
      id: wo.id,
      external_id: wo.external_id,
      status: wo.status,
    });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Work order create failed (inbound oem_vizio)', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

module.exports = {
  postInboundOemMock,
  postInboundExtWarrantyNew,
  postInboundCustomerPay,
  postInboundOemVizio,
};
