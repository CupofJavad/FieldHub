/**
 * M4.3 – Billing/claims rules: DIAG vs repair classification, deduction rules.
 * Per SCT design: result drives claim type (repair = full pay, diag = DIAG-only, denied = no pay).
 * Deductions: no parts return, late completion, etc.
 */

/** Result values that mean full repair (bill full labor/parts). */
const REPAIR_RESULTS = ['success', 'repaired', 'fixed', 'completed', 'parts_replaced'];

/** Result values that mean DIAG only (bill DIAG rate; no repair labor). */
const DIAG_RESULTS = ['no_problem_found', 'npf', 'unreachable', 'reschedule', 'customer_cancelled'];

/** Result values that mean denied / no pay. */
const DENIED_RESULTS = ['denied', 'rejected', 'defective_panel', 'duplicate', 'out_of_window'];

/**
 * Classify claim type from completion_payload.result for billing (DIAG vs repair).
 * @param {Object} completion_payload - WO completion_payload
 * @returns {'repair'|'diag'|'denied'}
 */
function classifyClaimType(completion_payload) {
  if (!completion_payload || typeof completion_payload !== 'object') return 'denied';
  const result = (completion_payload.result || '').toString().toLowerCase().trim();
  if (REPAIR_RESULTS.some(r => result === r || result.includes(r))) return 'repair';
  if (DIAG_RESULTS.some(r => result === r || result.includes(r))) return 'diag';
  if (DENIED_RESULTS.some(r => result === r || result.includes(r))) return 'denied';
  if (result) return 'repair'; // unknown positive result default to repair
  return 'denied';
}

/**
 * Compute deduction reasons for a completed WO (parts not returned, late, etc.).
 * @param {Object} wo - Work order with completion_payload, parts, requested_date_start, updated_at
 * @returns {{ code: string, reason: string }[]}
 */
function computeDeductions(wo) {
  const deductions = [];
  const payload = wo.completion_payload || {};
  const result = (payload.result || '').toString().toLowerCase();

  if (payload.deduction_reason) {
    deductions.push({ code: 'PROVIDER_REASON', reason: String(payload.deduction_reason) });
  }

  const partsUsed = payload.parts_used || payload.parts_used_list || wo.parts || [];
  const returnTracking = payload.return_tracking || payload.core_return_tracking;
  const hasParts = Array.isArray(partsUsed) ? partsUsed.length > 0 : false;
  if (hasParts && !returnTracking) {
    deductions.push({ code: 'NO_PARTS_RETURN', reason: 'Parts/core return tracking not received' });
  }

  if (wo.requested_date_start && wo.updated_at) {
    const start = new Date(wo.requested_date_start);
    const completed = new Date(wo.updated_at);
    const tatDays = Math.round((completed - start) / (24 * 60 * 60 * 1000));
    if (tatDays > 21) {
      deductions.push({ code: 'TAT_OVER_21', reason: `Completion TAT ${tatDays} days (over 21)` });
    }
  }

  if (['unreachable', 'no_problem_found', 'npf'].some(r => result.includes(r))) {
    deductions.push({ code: 'RESULT_DIAG', reason: `Result: ${result} (DIAG-only or no pay per provider rules)` });
  }

  return deductions;
}

module.exports = {
  classifyClaimType,
  computeDeductions,
  REPAIR_RESULTS,
  DIAG_RESULTS,
  DENIED_RESULTS,
};
