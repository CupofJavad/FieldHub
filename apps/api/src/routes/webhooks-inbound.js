/**
 * Inbound provider webhooks: POST /webhooks/inbound/:provider_key
 * Provider sends payload → map to canonical → create/upsert WO (idempotent by provider_key + external_id).
 */

const { createLogger } = require('@tgnd/logger');
const { createWorkOrder } = require('../db');
const { getMapperForProvider, getSupportedInboundProviders } = require('@tgnd/inbound-adapters');

const log = createLogger('api');

/** POST /webhooks/inbound/:provider_key – receive provider payload, map, create/update WO */
async function postWebhookInbound(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const provider_key = (req.params.provider_key || '').trim().toLowerCase();
  const body = req.body || {};

  if (!provider_key) {
    reqLog.warn('Inbound webhook: missing provider_key in path', 'WEBHOOK_INBOUND_BAD_REQUEST', {});
    return res.status(400).json({
      error: 'provider_key required in path: POST /webhooks/inbound/:provider_key',
      code: 'WEBHOOK_INBOUND_BAD_REQUEST',
    });
  }

  const mapper = getMapperForProvider(provider_key);
  if (!mapper) {
    reqLog.warn('Inbound webhook: unsupported provider', 'WEBHOOK_INBOUND_UNSUPPORTED_PROVIDER', {
      provider_key,
      supported: getSupportedInboundProviders(),
    });
    return res.status(404).json({
      error: `Unsupported provider_key: ${provider_key}`,
      code: 'WEBHOOK_INBOUND_UNSUPPORTED_PROVIDER',
      supported: getSupportedInboundProviders(),
    });
  }

  const result = mapper(body);
  if (result.error) {
    reqLog.warn('Inbound webhook: mapping validation failed', 'WO_VALIDATION_FAILED', {
      provider_key,
      reason: result.error,
    });
    return res.status(400).json({ error: result.error, code: 'WO_VALIDATION_FAILED' });
  }

  try {
    const wo = await createWorkOrder(reqLog, {
      ...result.canonical,
      idempotency_key: body.idempotency_key,
    });
    reqLog.info('Work order created/updated via inbound webhook', null, {
      id: wo.id,
      external_id: wo.external_id,
      provider_key: wo.provider_key,
      status: wo.status,
    });
    return res.status(201).json({ id: wo.id, external_id: wo.external_id, status: wo.status });
  } catch (err) {
    reqLog.error('Inbound webhook: create failed', 'WO_CREATE_FAILED', err);
    return res.status(500).json({ error: 'Work order creation failed', code: 'WO_CREATE_FAILED' });
  }
}

module.exports = { postWebhookInbound };
