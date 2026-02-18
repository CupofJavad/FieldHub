/**
 * Webhooks: field platform status → update WO.
 * POST /webhooks/field/workmarket – body: { platform_job_id, status [, completion_payload ] }
 * POST /webhooks/field/fieldnation – body: { platform_job_id, status (FN name, e.g. Work Done) [, completion_payload ] }
 */

const { createLogger } = require('@tgnd/logger');
const { getWorkOrderByPlatformJobId, updateWorkOrder, getServiceTypeConfig } = require('../db');
const { canTransition } = require('@tgnd/canonical-model');
const { validateCompletion } = require('../service-type-engine');
const { fieldNationStatusToTgnd } = require('@tgnd/outbound-adapters');

const log = createLogger('api');

/** POST /webhooks/field/workmarket – platform reports status; we update WO (e.g. completed). M2.1: completion validation. */
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
    const completionPayload = body.completion_payload || wo.completion_payload;
    const proposedWo = { ...wo, completion_payload: completionPayload };
    const config = await getServiceTypeConfig(wo.service_type);
    const validation = validateCompletion(proposedWo, config || {});
    if (!validation.valid) {
      reqLog.warn('Webhook: completion validation failed', 'WO_COMPLETION_VALIDATION_FAILED', { reason: validation.message });
      return res.status(400).json({ error: validation.message, code: 'WO_COMPLETION_VALIDATION_FAILED' });
    }
    const updates = { status: 'completed' };
    if (body.completion_payload) updates.completion_payload = body.completion_payload;
    await updateWorkOrder(wo.id, updates);
    reqLog.info('WO completed via webhook', null, { id: wo.id, platform_job_id });
  }
  return res.status(200).json({ received: true });
}

/** POST /webhooks/field/fieldnation – Field Nation reports status (FN names: Work Done, Assigned, etc.); we map to TGND and update WO. */
async function postWebhookFieldNation(req, res) {
  const requestId = req.id || `req-${Date.now()}`;
  const reqLog = log.child({ requestId });
  const body = req.body || {};
  const platformJobId = body.platform_job_id || body.work_order_id || body.id;
  if (!platformJobId) {
    return res.status(400).json({ error: 'platform_job_id (or work_order_id) required', code: 'WEBHOOK_BAD_REQUEST' });
  }
  const wo = await getWorkOrderByPlatformJobId(platformJobId);
  if (!wo) {
    reqLog.warn('Webhook: no WO for platform_job_id', 'WEBHOOK_UNKNOWN_JOB', { platform_job_id: platformJobId });
    return res.status(200).json({ received: true });
  }
  const fnStatus = body.status || body.status_name || body.state;
  const tgndStatus = fieldNationStatusToTgnd(fnStatus);
  if (tgndStatus === 'completed') {
    if (!canTransition(wo.status, 'completed')) {
      reqLog.warn('Webhook: invalid transition to completed', null, { wo_id: wo.id, current: wo.status });
      return res.status(200).json({ received: true });
    }
    const completionPayload = body.completion_payload || body.closing_notes ? { notes: body.closing_notes } : wo.completion_payload;
    const proposedWo = { ...wo, completion_payload: completionPayload };
    const config = await getServiceTypeConfig(wo.service_type);
    const validation = validateCompletion(proposedWo, config || {});
    if (!validation.valid) {
      reqLog.warn('Webhook: completion validation failed', 'WO_COMPLETION_VALIDATION_FAILED', { reason: validation.message });
      return res.status(400).json({ error: validation.message, code: 'WO_COMPLETION_VALIDATION_FAILED' });
    }
    const updates = { status: 'completed' };
    if (completionPayload) updates.completion_payload = completionPayload;
    await updateWorkOrder(wo.id, updates);
    reqLog.info('WO completed via Field Nation webhook', null, { id: wo.id, platform_job_id: platformJobId });
  }
  return res.status(200).json({ received: true });
}

module.exports = { postWebhookFieldWorkmarket, postWebhookFieldNation };
