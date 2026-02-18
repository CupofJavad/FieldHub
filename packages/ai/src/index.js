/**
 * @file index.js
 * TGND AI package: routing, scheduling, anomaly, extraction (M3.x).
 * M3.1: Rule-based routing/assignment (zip, radius, skills); recommend top N.
 */

const routing = require('./routing/index.js');

module.exports = {
  routing,
  recommendTopN: routing.recommendTopN,
  filterByZip: routing.filterByZip,
  filterByRadius: routing.filterByRadius,
  filterBySkills: routing.filterBySkills,
  scoreCandidates: routing.scoreCandidates,
};
