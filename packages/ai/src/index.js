/**
 * @file index.js
 * TGND AI package: routing, scheduling, anomaly, extraction (M3.x).
 * M3.1: Routing (zip, radius, skills); M3.2: Scheduling suggestions + anomaly alerts.
 */

const routing = require('./routing/index.js');
const scheduling = require('./scheduling/index.js');
const anomaly = require('./anomaly/index.js');
const extraction = require('./extraction/index.js');
const dispatch = require('./dispatch/index.js');
const agents = require('./agents/index.js');

module.exports = {
  routing,
  scheduling,
  anomaly,
  extraction,
  dispatch,
  agents,
  recommendTopN: routing.recommendTopN,
  filterByZip: routing.filterByZip,
  filterByRadius: routing.filterByRadius,
  filterBySkills: routing.filterBySkills,
  scoreCandidates: routing.scoreCandidates,
  getSchedulingSuggestions: scheduling.getSchedulingSuggestions,
  getReadyToSchedule: scheduling.getReadyToSchedule,
  suggestAppointmentWindows: scheduling.suggestAppointmentWindows,
  detectAnomalies: anomaly.detectAnomalies,
  extractWoFieldsFromText: extraction.extractWoFieldsFromText,
  parseDispatchUtterance: dispatch.parseDispatchUtterance,
  suggestPartsReconciliation: agents.suggestPartsReconciliation,
  suggestOpenCores: agents.suggestOpenCores,
  prepareClaim: agents.prepareClaim,
  buildClaimSubmissionPayload: agents.buildClaimSubmissionPayload,
  proposeClaimStatusUpdate: agents.proposeClaimStatusUpdate,
  ingestProviderResponse: agents.ingestProviderResponse,
  suggestTechReminders: agents.suggestTechReminders,
  classifyBillingType: agents.classifyBillingType,
  applyDeductionRules: agents.applyDeductionRules,
};
