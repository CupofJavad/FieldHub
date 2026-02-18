/**
 * @file agents/index.js
 * M3.5: AI-led agents – parts reconciliation, claim-processing, outbound tech comms.
 * All propose/draft; human in the loop for approval before master data or send.
 */

const partsReconciliation = require('./parts-reconciliation.js');
const claimProcessing = require('./claim-processing.js');
const techComms = require('./tech-comms.js');
const billingRules = require('./billing-rules.js');

module.exports = {
  partsReconciliation,
  claimProcessing,
  techComms,
  billingRules,
  suggestPartsReconciliation: partsReconciliation.suggestPartsReconciliation,
  suggestOpenCores: partsReconciliation.suggestOpenCores,
  prepareClaim: claimProcessing.prepareClaim,
  buildClaimSubmissionPayload: claimProcessing.buildClaimSubmissionPayload,
  proposeClaimStatusUpdate: claimProcessing.proposeClaimStatusUpdate,
  ingestProviderResponse: claimProcessing.ingestProviderResponse,
  suggestTechReminders: techComms.suggestTechReminders,
  classifyBillingType: billingRules.classifyBillingType,
  applyDeductionRules: billingRules.applyDeductionRules,
};
