/**
 * @file routing/index.js
 * M3.1: Rule-based routing/assignment (zip, radius, skills); optional "recommend top N".
 * Human assigns; this module suggests ranking (per SCT_AI_and_Human_Operating_Model).
 */

const { filterByZip, filterByRadius, filterBySkills, scoreCandidates, recommendTopN } = require('./rules.js');

module.exports = {
  filterByZip,
  filterByRadius,
  filterBySkills,
  scoreCandidates,
  recommendTopN,
};
