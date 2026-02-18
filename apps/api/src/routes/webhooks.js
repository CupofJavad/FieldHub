/**
 * Webhooks: field platform status (e.g. WorkMarket completed) → update WO.
 * POST /webhooks/field/workmarket – body: { platform_job_id, status [, completion_payload ] }
 */

const { createLogger } = require('@tgnd/logger');
const { getWorkOrderByPlatformJobId, updateWorkOrder } = require('../db');
const { canTransition } = require('@tgnd/canonical-model');

const log = createLogger('api');

/** POST /webhooks/field/workmarket – platform reports status; we update WO (e.g. completed) */
async function postWebhookFieldWorkmarket(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};
  const { platform_job_id, status } = body;
  if (!platform_job_id) {
    return res.status(400).json({ error: 'platform_job_id required', code: 'WEBHOOK_BAD_REQUEST' });
  }
  const wo = await getWorkOrderByPlatformJobId(platform_job_id);
  if (!wo) {
    reqLog.warn('Webhook: no WO for platform_job_id', 'WEBHOOK_UNKNOWN_JOB', { platform_job_id });
    return res.status(200).json({ received: true }); // acknowledge to avoid platform retries
  }
  const newStatus = status === 'completed' ? 'completed' : null;
  if (newStatus === 'completed') {
    if (!canTransition(wo.status, 'completed')) {
      reqLog.warn('Webhook: invalid transition to completed', null, { wo_id: wo.id, current: wo.status });
      return res.status(200).json({ received: true });
    }
    const updates = { status: 'completed' };
    if (body.completion_payload) {
      updates.metadata = { ...(wo.metadata || {}), completion_payload: body.completion_payload };
    }
    await updateWorkOrder(wo.id, updates);
    reqLog.info('WO completed via webhook', null, { id: wo.id, platform_job_id });
  }
  return res.status(200).json({ received: true });
}

module.exports = { postWebhookFieldWorkmarket };
