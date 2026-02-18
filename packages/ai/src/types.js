/**
 * @file types.js
 * Types for AI package: routing input/output and config.
 * Aligns with SCT Enhanced System Design §6 (routing by zip, radius, skills).
 *
 * @typedef {Object} AddressForRouting
 * @property {string} [zip] - Postal code (required for zip-based rules)
 * @property {number} [latitude] - Optional; required for radius (miles) when used
 * @property {number} [longitude]
 *
 * @typedef {Object} WorkOrderForRouting
 * @property {string} id - Internal WO id
 * @property {AddressForRouting} [ship_to] - Service address (zip required; lat/lon optional for radius)
 * @property {string} [service_type] - osr | oss_last_mile | installation | depot_repair | etc.
 * @property {string[]} [required_skills] - Skills/certs required for this job (e.g. ['tv_repair','osr'])
 *
 * @typedef {Object} TechnicianCandidate
 * @property {string} id - Tech or platform worker id
 * @property {string} [zip] - Tech home/base zip
 * @property {number} [latitude] - Optional; used for radius filtering/scoring when present
 * @property {number} [longitude]
 * @property {string[]} [skills] - Skills/certs (e.g. ['tv_repair','osr'])
 * @property {string} [platform_type] - workmarket | field_nation | internal
 *
 * @typedef {Object} RoutingConfig
 * @property {number} [maxRadiusMiles] - Max distance (mi) for radius rule; used when lat/lon present
 * @property {boolean} [requireAllSkills] - If true, tech must have all required_skills; default true
 * @property {Object.<string, string[]>} [serviceTypeSkills] - Default required_skills per service_type (merged with WO.required_skills)
 * @property {boolean} [sameZipOnly] - If true, only techs with same zip as WO; default false when radius used
 *
 * @typedef {Object} ScoredCandidate
 * @property {TechnicianCandidate} candidate
 * @property {number} score - Higher = better (distance and skill match)
 * @property {number} [distanceMiles] - When lat/lon available
 * @property {boolean} skillsMatch
 */

module.exports = {};
