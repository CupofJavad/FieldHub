/**
 * @file agents/claim-processing.js
 * M3.5: Claim-processing agent – map completion payload to provider claim format; prepare/submit suggestions; flag denials.
 * Agent proposes; human reviews/approves. Per SCT_AI_and_Human_Operating_Model §3.2.
 */

/**
 * Map WO completion_payload to a generic provider claim format (ready for provider API or batch).
 * @param {Object} wo - Work order with id, external_id, provider_key, completion_payload, requested_date_start, updated_at
 * @returns {{ proposed_claim: Object, ready_for_submit: boolean, denial_reasons?: string[] }}
 */
function prepareClaim(wo) {
  const payload = wo.completion_payload || {};
  const result = (payload.result || '').toString().toLowerCase();
  const partsUsed = payload.parts_used || payload.parts_used_list || [];
  const completedAt = wo.updated_at || wo.completion_payload?.completed_at;

  const proposed_claim = {
    work_order_id: wo.id,
    external_id: wo.external_id,
    provider_key: wo.provider_key,
    result: payload.result ?? 'success',
    parts_used: Array.isArray(partsUsed) ? partsUsed : [],
    completed_at: completedAt || null,
    tat_days: null,
  };

  if (wo.requested_date_start && completedAt) {
    const start = new Date(wo.requested_date_start);
    const end = new Date(completedAt);
    proposed_claim.tat_days = Math.round((end - start) / (24 * 60 * 60 * 1000));
  }

  const denialReasons = [];
  if (['no_problem_found', 'npf', 'unreachable', 'denied', 'rejected', 'reschedule'].some((r) => result.includes(r))) {
    denialReasons.push(result || 'negative_result');
  }
  if (payload.deduction_reason) denialReasons.push(String(payload.deduction_reason));

  const ready_for_submit = wo.status === 'completed' && !!wo.completion_payload;

  return {
    proposed_claim,
    ready_for_submit,
    denial_reasons: denialReasons.length ? denialReasons : undefined,
  };
}

/**
 * Given a provider response (approved/denied/partial), suggest WO/claim status update. Human applies.
 * @param {Object} providerResponse - { claim_id?, status: 'approved'|'denied'|'partial', reason?, deduction_code? }
 * @param {Object} [wo] - Related WO if available
 * @returns {{ suggested_action: string, update_claim_status?: string, flag_for_human?: boolean }}
 */
function proposeClaimStatusUpdate(providerResponse, wo = null) {
  const status = (providerResponse?.status || '').toLowerCase();
  const suggestion = {
    suggested_action: status === 'approved' ? 'Close claim; no further action' : 'Flag for human review',
    update_claim_status: status,
    flag_for_human: status !== 'approved',
  };
  if (providerResponse?.reason) suggestion.denial_reason = providerResponse.reason;
  if (providerResponse?.deduction_code) suggestion.deduction_code = providerResponse.deduction_code;
  return suggestion;
}

module.exports = {
  prepareClaim,
  proposeClaimStatusUpdate,
};
