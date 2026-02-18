/**
 * @file agents/billing-rules.js
 * M4.3: DIAG vs repair classification and deduction rules for billing/claims.
 * Used by claim-processing agent. Per SCT design: completion feeds billing (DIAG vs full repair, deductions).
 */

/** Result values that count as DIAG-only (no repair; provider may pay DIAG rate or deny). */
const DIAG_RESULTS = new Set([
  'no_problem_found', 'npf', 'unreachable', 'reschedule', 'no_access', 'cancelled',
]);

/** Result values that count as full repair (parts replaced, success). */
const REPAIR_RESULTS = new Set(['success', 'repaired', 'fixed', 'completed']);

/**
 * Classify billing type: DIAG (no repair) vs repair (parts replaced / success).
 * @param {Object} wo - Work order with completion_payload: { result, parts_used }
 * @returns {'diag'|'repair'}
 */
function classifyBillingType(wo) {
  const payload = wo.completion_payload || {};
  const result = (payload.result || '').toString().toLowerCase().replace(/\s+/g, '_');
  const partsUsed = payload.parts_used || payload.parts_used_list || [];
  const hasPartsUsed = Array.isArray(partsUsed) ? partsUsed.length > 0 : false;

  if (REPAIR_RESULTS.has(result) && hasPartsUsed) return 'repair';
  if (DIAG_RESULTS.has(result)) return 'diag';
  if (REPAIR_RESULTS.has(result) && !hasPartsUsed) return 'diag'; // success but no parts = DIAG
  return 'diag'; // unknown/negative default to DIAG
}

/** Deduction codes (per SCT: parts not shipped, carrier, schedule date, etc.). */
const DEDUCTION_CODES = Object.freeze({
  PARTS_NOT_SHIPPED: 'parts_not_shipped',
  CARRIER_DELAY: 'carrier_delay',
  SCHEDULE_DATE: 'schedule_date',
  UNREACHABLE: 'unreachable',
  NPF: 'no_problem_found',
  PANEL_DEFECT: 'panel_defect',
  DUPLICATE: 'duplicate',
  TAT_BREACH: 'tat_breach',
  PARTS_NOT_RETURNED: 'parts_not_returned',
  OTHER: 'other',
});

/**
 * Apply deduction rules to a completed WO; return list of applicable deduction codes.
 * @param {Object} wo - Work order with completion_payload, parts, requested_date_start, updated_at
 * @param {{ tatThresholdDays?: number }} [options]
 * @returns {string[]} Deduction codes (e.g. unreachable, npf, tat_breach)
 */
function applyDeductionRules(wo, options = {}) {
  const tatThresholdDays = options.tatThresholdDays ?? 7;
  const deductions = [];
  const payload = wo.completion_payload || {};
  const result = (payload.result || '').toString().toLowerCase();

  if (['unreachable', 'no_access'].some((r) => result.includes(r))) deductions.push(DEDUCTION_CODES.UNREACHABLE);
  if (['no_problem_found', 'npf'].some((r) => result.includes(r))) deductions.push(DEDUCTION_CODES.NPF);
  if (payload.deduction_code) deductions.push(payload.deduction_code);
  if (payload.panel_defect) deductions.push(DEDUCTION_CODES.PANEL_DEFECT);
  if (payload.duplicate) deductions.push(DEDUCTION_CODES.DUPLICATE);

  const requestedStart = wo.requested_date_start ? new Date(wo.requested_date_start) : null;
  const completedAt = wo.updated_at ? new Date(wo.updated_at) : null;
  if (requestedStart && completedAt) {
    const tatDays = Math.round((completedAt - requestedStart) / (24 * 60 * 60 * 1000));
    if (tatDays > tatThresholdDays) deductions.push(DEDUCTION_CODES.TAT_BREACH);
  }

  const parts = wo.parts || [];
  const hasOpenCore = parts.some((p) => (p.vendor_tail != null || p.return_expected) && !(p.return_tracking && String(p.return_tracking).trim()));
  if (hasOpenCore && wo.status === 'completed') deductions.push(DEDUCTION_CODES.PARTS_NOT_RETURNED);

  return [...new Set(deductions)];
}

module.exports = {
  classifyBillingType,
  applyDeductionRules,
  DEDUCTION_CODES,
  DIAG_RESULTS,
  REPAIR_RESULTS,
};
