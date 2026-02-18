/**
 * @file agents/claim-processing.js
 * M3.5 / M4.3: Claim-processing agent – map completion to claim format; DIAG vs repair; deductions; submission; ingest provider responses.
 * Agent proposes; human reviews/approves. Per SCT_AI_and_Human_Operating_Model §3.2.
 */

const { classifyBillingType, applyDeductionRules } = require('./billing-rules.js');

/**
 * Map WO completion_payload to a generic provider claim format (ready for provider API or batch).
 * M4.3: Includes billing_type (diag|repair) and deductions.
 * @param {Object} wo - Work order with id, external_id, provider_key, completion_payload, requested_date_start, updated_at, parts
 * @param {{ tatThresholdDays?: number }} [options]
 * @returns {{ proposed_claim: Object, ready_for_submit: boolean, denial_reasons?: string[], billing_type: 'diag'|'repair', deductions: string[] }}
 */
function prepareClaim(wo, options = {}) {
  const payload = wo.completion_payload || {};
  const result = (payload.result || '').toString().toLowerCase();
  const partsUsed = payload.parts_used || payload.parts_used_list || [];
  const completedAt = wo.updated_at || wo.completion_payload?.completed_at;

  const billing_type = classifyBillingType(wo);
  const deductions = applyDeductionRules(wo, options);

  const proposed_claim = {
    work_order_id: wo.id,
    external_id: wo.external_id,
    provider_key: wo.provider_key,
    result: payload.result ?? 'success',
    parts_used: Array.isArray(partsUsed) ? partsUsed : [],
    completed_at: completedAt || null,
    tat_days: null,
    billing_type,
    deductions,
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
    billing_type,
    deductions,
  };
}

/**
 * Build claim payload for provider submission (API or batch file). Human or system submits.
 * @param {Object} wo
 * @param {{ provider_format?: 'generic'|'oem'|'ext_warranty' }} [options]
 * @returns {Object} Claim submission payload (billing_type, deductions, WO refs, TAT, result, parts_used)
 */
function buildClaimSubmissionPayload(wo, options = {}) {
  const { proposed_claim, billing_type, deductions } = prepareClaim(wo, options);
  const format = options.provider_format || 'generic';
  const base = {
    work_order_id: proposed_claim.work_order_id,
    external_id: proposed_claim.external_id,
    provider_key: proposed_claim.provider_key,
    billing_type,
    deductions,
    result: proposed_claim.result,
    parts_used: proposed_claim.parts_used,
    completed_at: proposed_claim.completed_at,
    tat_days: proposed_claim.tat_days,
  };
  if (format === 'oem') {
    return { ...base, claim_type: billing_type === 'repair' ? 'REPAIR' : 'DIAG', deduction_codes: deductions };
  }
  if (format === 'ext_warranty') {
    return { ...base, auth_type: billing_type, denial_risk: deductions.length > 0 };
  }
  return base;
}

/**
 * Given a provider response (approved/denied/partial), suggest WO/claim status update. Human applies.
 * @param {Object} providerResponse - { claim_id?, status: 'approved'|'denied'|'partial', reason?, deduction_code? }
 * @param {Object} [wo] - Related WO if available
 * @returns {{ suggested_action: string, update_claim_status?: string, flag_for_human?: boolean, suggested_wo_updates?: Object }}
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

/**
 * Ingest provider response: map to suggested WO metadata updates and claim status. Human approves before PATCH.
 * M4.3: Ingestion of provider responses; output suitable for API to apply or for Report Center to show.
 * @param {Object} providerResponse - { claim_id?, work_order_id?, status: 'approved'|'denied'|'partial', reason?, deduction_code?, amount_paid? }
 * @param {Object} [wo] - Related WO if available (for context)
 * @returns {{ suggested_action: string, suggested_wo_updates: Object, claim_status: string, flag_for_human: boolean }}
 */
function ingestProviderResponse(providerResponse, wo = null) {
  const status = (providerResponse?.status || '').toLowerCase();
  const suggested_wo_updates = {
    metadata: {
      claim_status: status,
      claim_updated_at: new Date().toISOString(),
    },
  };
  if (providerResponse?.reason) suggested_wo_updates.metadata.claim_denial_reason = providerResponse.reason;
  if (providerResponse?.deduction_code) suggested_wo_updates.metadata.claim_deduction_code = providerResponse.deduction_code;
  if (providerResponse?.amount_paid != null) suggested_wo_updates.metadata.claim_amount_paid = providerResponse.amount_paid;

  return {
    suggested_action: status === 'approved' ? 'Apply suggested_wo_updates; optionally set WO status to closed' : 'Review denial; apply suggested_wo_updates; escalate if needed',
    suggested_wo_updates,
    claim_status: status,
    flag_for_human: status !== 'approved',
    denial_reason: providerResponse?.reason ?? null,
    deduction_code: providerResponse?.deduction_code ?? null,
  };
}

module.exports = {
  prepareClaim,
  buildClaimSubmissionPayload,
  proposeClaimStatusUpdate,
  ingestProviderResponse,
};
