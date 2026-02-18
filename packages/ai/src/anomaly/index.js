/**
 * @file anomaly/index.js
 * M3.2: Anomaly alerts (TAT, rejection, stuck WOs).
 */

const { detectAnomalies, isNegativeResult, NEGATIVE_RESULTS } = require('./alerts.js');

module.exports = {
  detectAnomalies,
  isNegativeResult,
  NEGATIVE_RESULTS,
};
