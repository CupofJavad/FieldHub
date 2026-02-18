/**
 * @file dispatch/parse.js
 * M3.4: Conversational dispatch – parse utterance to intent + entities, then suggest API actions.
 * Rule-based (regex/keywords); human confirms before execution.
 */

/** Supported intents */
const INTENTS = Object.freeze(['schedule_wo', 'list_open', 'assign_wo', 'unknown']);

/** Zip: 5 digits or 5+4 */
const ZIP_RE = /\b(\d{5})(?:-?\d{4})?\b/g;
/** WO id: UUID-like or short hex/uuid segment */
const WO_ID_RE = /\b(wo[-_]?)?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9-]{6,36})\b/gi;
/** Date: YYYY-MM-DD or "tomorrow" / "next week" */
const ISO_DATE_RE = /\b(20\d{2}-\d{2}-\d{2})\b/g;
const TOMORROW_RE = /\btomorrow\b/i;
const NEXT_WEEK_RE = /\bnext\s+week\b/i;

/**
 * Extract entities from utterance.
 * @param {string} utterance
 * @returns {{ zip?: string[], wo_id?: string, date?: string, date_end?: string }}
 */
function extractEntities(utterance) {
  const text = String(utterance || '');
  const entities = {};

  const zips = [...text.matchAll(ZIP_RE)].map((m) => m[1]);
  if (zips.length) entities.zip = [...new Set(zips)];

  const woMatch = text.match(WO_ID_RE);
  if (woMatch) entities.wo_id = woMatch[0].replace(/^wo[-_]?/i, '').trim();

  const isoDates = [...text.matchAll(ISO_DATE_RE)].map((m) => m[1]);
  if (isoDates.length >= 1) entities.date = isoDates[0];
  if (isoDates.length >= 2) entities.date_end = isoDates[1];

  if (TOMORROW_RE.test(text) && !entities.date) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    entities.date = d.toISOString().slice(0, 10);
  }
  if (NEXT_WEEK_RE.test(text) && !entities.date) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    entities.date = d.toISOString().slice(0, 10);
  }

  return entities;
}

/**
 * Detect intent from utterance (keyword-based).
 * @param {string} utterance
 * @returns {string} One of INTENTS
 */
function detectIntent(utterance) {
  const lower = String(utterance || '').toLowerCase().trim();
  if (!lower) return 'unknown';

  if (/\b(schedule|book|set\s+appointment|next\s+available|ready\s+to\s+schedule)\b/.test(lower)) return 'schedule_wo';
  if (/\b(list|show|get|find)\s+(open|pending|scheduling|unassigned|work\s+orders?)\b/.test(lower)) return 'list_open';
  if (/\b(open|scheduling|pending)\s+(wo|work\s+orders?|jobs?)\b/.test(lower)) return 'list_open';
  if (/\b(assign|dispatch|send|push)\b/.test(lower) && (lower.includes('wo') || lower.includes('work') || lower.includes('job') || /\b[a-f0-9-]{8,}\b/.test(lower))) return 'assign_wo';
  if (/\bassign\s+(wo\s+)?[a-f0-9-]{8,}/i.test(utterance)) return 'assign_wo';

  return 'unknown';
}

/**
 * Map intent + entities to suggested API actions (human executes or confirms).
 * @param {string} intent
 * @param {Object} entities
 * @returns {Array<{ method: string, path: string, query?: Object, description: string }>}
 */
function suggestedActionsFor(intent, entities) {
  const actions = [];

  if (intent === 'list_open') {
    actions.push({
      method: 'GET',
      path: '/v1/work-orders',
      query: { status: 'scheduling' },
      description: 'List work orders in scheduling (open)',
    });
    actions.push({
      method: 'GET',
      path: '/v1/work-orders',
      query: { status: 'parts_shipped' },
      description: 'List work orders with parts shipped, ready to schedule',
    });
  }

  if (intent === 'schedule_wo') {
    actions.push({
      method: 'GET',
      path: '/v1/ai/scheduling-suggestions',
      query: entities.zip && entities.zip[0] ? {} : { slots_count: '5' },
      description: 'Get ready-to-schedule WOs and suggested appointment slots',
    });
    if (entities.wo_id) {
      actions.push({
        method: 'GET',
        path: '/v1/ai/scheduling-suggestions',
        query: { wo_id: entities.wo_id, slots_count: '5' },
        description: `Get suggested slots for WO ${entities.wo_id}`,
      });
    }
  }

  if (intent === 'assign_wo' && entities.wo_id) {
    actions.push({
      method: 'POST',
      path: `/v1/work-orders/${entities.wo_id}/assign`,
      description: `Assign work order ${entities.wo_id} to field platform (human confirm)`,
    });
  }

  if (intent === 'assign_wo' && !entities.wo_id) {
    actions.push({
      method: 'GET',
      path: '/v1/work-orders',
      query: { status: 'scheduling' },
      description: 'List WOs in scheduling so you can pick one to assign',
    });
  }

  return actions;
}

/**
 * Parse utterance into intent, entities, and suggested API actions.
 * @param {string} utterance
 * @returns {{ intent: string, entities: Object, suggested_actions: Array }}
 */
function parseDispatchUtterance(utterance) {
  const intent = detectIntent(utterance);
  const entities = extractEntities(utterance);
  const suggested_actions = suggestedActionsFor(intent, entities);
  return { intent, entities, suggested_actions };
}

module.exports = {
  parseDispatchUtterance,
  detectIntent,
  extractEntities,
  suggestedActionsFor,
  INTENTS,
};
