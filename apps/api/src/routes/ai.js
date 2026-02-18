/**
 * @file routes/ai.js
 * M3.2–M3.3: AI endpoints – scheduling, anomaly alerts, document/notes extraction.
 * Human decides; AI suggests.
 */

const { createLogger } = require('@tgnd/logger');
const {
  getSchedulingSuggestions,
  detectAnomalies,
  extractWoFieldsFromText,
  parseDispatchUtterance,
  suggestPartsReconciliation,
  suggestOpenCores,
  prepareClaim,
  suggestTechReminders,
} = require('@tgnd/ai');
const { listWorkOrders, getWorkOrderById } = require('../db');

const log = createLogger('api');

/**
 * GET /v1/ai/scheduling-suggestions
 * Query: wo_id (optional) – if set, also return suggested_slots for that WO.
 * Returns: { ready: WO[], suggested_slots?: { date, label }[] }
 */
async function getSchedulingSuggestionsHandler(req, res) {
  const woId = req.query.wo_id;
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    const workOrders = await listWorkOrders(filters);
    const singleWo = woId ? await getWorkOrderById(woId) : null;
    const options = {
      statuses: req.query.statuses ? req.query.statuses.split(',') : undefined,
      slotsCount: req.query.slots_count ? parseInt(req.query.slots_count, 10) : 5,
    };
    const result = getSchedulingSuggestions(workOrders, singleWo, options);
    return res.json(result);
  } catch (err) {
    log.error('Scheduling suggestions failed', 'AI_SCHEDULING_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Scheduling suggestions failed', code: 'AI_SCHEDULING_ERROR' });
  }
}

/**
 * GET /v1/ai/anomalies
 * Query: status, provider_key, date_from, date_to (passed to listWorkOrders); tat_threshold_days, stuck_threshold_days.
 * Returns: { anomalies: Array<{ type, wo_id?, details, severity, ... }> }
 */
async function getAnomaliesHandler(req, res) {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.provider_key) filters.provider_key = req.query.provider_key;
    if (req.query.date_from) filters.date_from = req.query.date_from;
    if (req.query.date_to) filters.date_to = req.query.date_to;
    const workOrders = await listWorkOrders(filters);
    const config = {
      tatThresholdDays: req.query.tat_threshold_days ? parseInt(req.query.tat_threshold_days, 10) : 7,
      stuckThresholdDays: req.query.stuck_threshold_days ? parseInt(req.query.stuck_threshold_days, 10) : 5,
    };
    const anomalies = detectAnomalies(workOrders, config);
    return res.json({ anomalies });
  } catch (err) {
    log.error('Anomaly detection failed', 'AI_ANOMALY_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Anomaly detection failed', code: 'AI_ANOMALY_ERROR' });
  }
}

/**
 * POST /v1/ai/extract-notes (M3.3)
 * Body: { text: string } – notes or document body.
 * Returns: { suggested_wo_fields: object|null, error?: string }. Human reviews then POST /v1/work-orders with merged body (external_id, provider_key, payer_type, service_type required).
 */
async function postExtractNotesHandler(req, res) {
  const text = req.body?.text;
  if (text == null) {
    return res.status(400).json({ error: 'Body must include text', code: 'WO_EXTRACT_BAD_REQUEST' });
  }
  try {
    const result = await extractWoFieldsFromText(text);
    if (result.error && !result.suggested_wo_fields) {
      return res.status(503).json({ error: result.error, code: 'AI_EXTRACT_UNAVAILABLE', suggested_wo_fields: null });
    }
    return res.json({
      suggested_wo_fields: result.suggested_wo_fields ?? {},
      error: result.error || null,
    });
  } catch (err) {
    log.error('Notes extraction failed', 'AI_EXTRACT_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Notes extraction failed', code: 'AI_EXTRACT_ERROR', suggested_wo_fields: null });
  }
}

/**
 * POST /v1/ai/dispatch-parse (M3.4)
 * Body: { utterance: string }. Returns { intent, entities, suggested_actions }.
 * Human confirms before executing any suggested_actions (GET/POST to API).
 */
function postDispatchParseHandler(req, res) {
  const utterance = req.body?.utterance;
  if (utterance == null) {
    return res.status(400).json({ error: 'Body must include utterance', code: 'DISPATCH_PARSE_BAD_REQUEST' });
  }
  try {
    const result = parseDispatchUtterance(utterance);
    return res.json(result);
  } catch (err) {
    log.error('Dispatch parse failed', 'AI_DISPATCH_PARSE_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Dispatch parse failed', code: 'AI_DISPATCH_PARSE_ERROR' });
  }
}

/** POST /v1/ai/agents/parts/suggest (M3.5) – body: { work_orders, tracking_events? }. Human approves before applying. */
async function postAgentsPartsSuggestHandler(req, res) {
  try {
    const { work_orders = [], tracking_events = [] } = req.body || {};
    const suggestions = suggestPartsReconciliation(work_orders, tracking_events);
    const openCores = suggestOpenCores(work_orders, { openAfterDays: req.body?.open_after_days ?? 14 });
    return res.json({ ...suggestions, ...openCores });
  } catch (err) {
    log.error('Parts suggest failed', 'AI_AGENTS_PARTS_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Parts reconciliation suggest failed', code: 'AI_AGENTS_PARTS_ERROR' });
  }
}

/** POST /v1/ai/agents/claims/prepare (M3.5) – body: { work_order }. Returns proposed_claim; human submits. */
function postAgentsClaimsPrepareHandler(req, res) {
  try {
    const wo = req.body?.work_order;
    if (!wo) return res.status(400).json({ error: 'Body must include work_order', code: 'AI_AGENTS_CLAIMS_BAD_REQUEST' });
    const result = prepareClaim(wo);
    return res.json(result);
  } catch (err) {
    log.error('Claims prepare failed', 'AI_AGENTS_CLAIMS_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Claim prepare failed', code: 'AI_AGENTS_CLAIMS_ERROR' });
  }
}

/** POST /v1/ai/agents/tech-comms/suggest (M3.5) – body: { work_orders, options? }. Returns pending_messages; human approves before send. */
function postAgentsTechCommsSuggestHandler(req, res) {
  try {
    const { work_orders = [], options = {} } = req.body || {};
    const result = suggestTechReminders(work_orders, options);
    return res.json(result);
  } catch (err) {
    log.error('Tech comms suggest failed', 'AI_AGENTS_TECHCOMMS_ERROR', { error: err.message });
    return res.status(500).json({ error: 'Tech comms suggest failed', code: 'AI_AGENTS_TECHCOMMS_ERROR' });
  }
}

module.exports = {
  getSchedulingSuggestionsHandler,
  getAnomaliesHandler,
  postExtractNotesHandler,
  postDispatchParseHandler,
  postAgentsPartsSuggestHandler,
  postAgentsClaimsPrepareHandler,
  postAgentsTechCommsSuggestHandler,
};
