/**
 * @file routing/rules.js
 * Rule-based routing: zip, radius (miles), skills. Scoring for "recommend top N".
 */

const DEFAULT_CONFIG = {
  maxRadiusMiles: 50,
  requireAllSkills: true,
  serviceTypeSkills: {},
  sameZipOnly: false,
};

/**
 * Normalize zip for comparison (strip spaces, take first 5 digits US).
 * @param {string} [zip]
 * @returns {string}
 */
function normalizeZip(zip) {
  if (zip == null || typeof zip !== 'string') return '';
  return String(zip).replace(/\D/g, '').slice(0, 5);
}

/**
 * Haversine distance in miles between two lat/lon points.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter candidates to those matching WO zip.
 * - If config.sameZipOnly: only exact same 5-digit zip.
 * - Otherwise: same zip preferred but not required (caller may also use radius).
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').TechnicianCandidate[]} candidates
 * @param {import('../types.js').RoutingConfig} [config]
 * @returns {import('../types.js').TechnicianCandidate[]}
 */
function filterByZip(workOrder, candidates, config = {}) {
  const woZip = normalizeZip(workOrder.ship_to?.zip);
  if (!woZip) return candidates;

  const sameZipOnly = config.sameZipOnly === true;

  return candidates.filter((t) => {
    const tZip = normalizeZip(t.zip);
    if (!tZip) return !sameZipOnly; // no tech zip: include only if we're not strict same-zip
    return sameZipOnly ? tZip === woZip : true;
  });
}

/**
 * Filter candidates to those within maxRadiusMiles of WO ship_to (when lat/lon present).
 * If WO or tech missing lat/lon, they are excluded from radius check (tech kept if no radius used).
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').TechnicianCandidate[]} candidates
 * @param {import('../types.js').RoutingConfig} [config]
 * @returns {import('../types.js').TechnicianCandidate[]}
 */
function filterByRadius(workOrder, candidates, config = {}) {
  const maxMiles = config.maxRadiusMiles ?? DEFAULT_CONFIG.maxRadiusMiles;
  const woLat = workOrder.ship_to?.latitude;
  const woLon = workOrder.ship_to?.longitude;
  const hasWoPoint = typeof woLat === 'number' && typeof woLon === 'number';

  if (!hasWoPoint) return candidates; // no geo: no radius filter

  return candidates.filter((t) => {
    const tLat = t.latitude;
    const tLon = t.longitude;
    if (typeof tLat !== 'number' || typeof tLon !== 'number') return false;
    const miles = haversineMiles(woLat, woLon, tLat, tLon);
    return miles <= maxMiles;
  });
}

/**
 * Resolve required skills for WO: WO.required_skills + config.serviceTypeSkills[service_type].
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').RoutingConfig} [config]
 * @returns {string[]}
 */
function getRequiredSkills(workOrder, config = {}) {
  const fromWo = workOrder.required_skills ?? [];
  const st = workOrder.service_type;
  const fromConfig = (st && config.serviceTypeSkills?.[st]) ?? [];
  const set = new Set([...fromWo, ...fromConfig]);
  return [...set];
}

/**
 * Filter candidates to those matching required skills (all required present in tech.skills).
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').TechnicianCandidate[]} candidates
 * @param {import('../types.js').RoutingConfig} [config]
 * @returns {import('../types.js').TechnicianCandidate[]}
 */
function filterBySkills(workOrder, candidates, config = {}) {
  const required = getRequiredSkills(workOrder, config);
  if (required.length === 0) return candidates;

  const requireAll = config.requireAllSkills !== false;

  return candidates.filter((t) => {
    const techSkills = new Set((t.skills ?? []).map((s) => String(s).toLowerCase()));
    if (requireAll) {
      return required.every((r) => techSkills.has(String(r).toLowerCase()));
    }
    return required.some((r) => techSkills.has(String(r).toLowerCase()));
  });
}

/**
 * Score candidates for ranking: lower distance = higher score; full skill match = bonus.
 * Returns array of { candidate, score, distanceMiles?, skillsMatch }.
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').TechnicianCandidate[]} candidates
 * @param {import('../types.js').RoutingConfig} [config]
 * @returns {import('../types.js').ScoredCandidate[]}
 */
function scoreCandidates(workOrder, candidates, config = {}) {
  const required = getRequiredSkills(workOrder, config);
  const woLat = workOrder.ship_to?.latitude;
  const woLon = workOrder.ship_to?.longitude;
  const hasWoPoint = typeof woLat === 'number' && typeof woLon === 'number';
  const woZip = normalizeZip(workOrder.ship_to?.zip);

  return candidates.map((c) => {
    let distanceMiles = null;
    if (hasWoPoint && typeof c.latitude === 'number' && typeof c.longitude === 'number') {
      distanceMiles = haversineMiles(woLat, woLon, c.latitude, c.longitude);
    }

    const techSkills = new Set((c.skills ?? []).map((s) => String(s).toLowerCase()));
    const skillsMatch = required.length === 0 || required.every((r) => techSkills.has(String(r).toLowerCase()));

    // Score: higher is better. 1000 base, -distance (closer = better), +100 if same zip, +50 if skills match
    let score = 1000;
    if (distanceMiles != null) score -= Math.min(distanceMiles * 2, 500);
    if (woZip && normalizeZip(c.zip) === woZip) score += 100;
    if (skillsMatch) score += 50;

    return { candidate: c, score, distanceMiles: distanceMiles ?? undefined, skillsMatch };
  });
}

/**
 * Apply zip, radius, and skills rules then return top N candidates by score.
 * @param {import('../types.js').WorkOrderForRouting} workOrder
 * @param {import('../types.js').TechnicianCandidate[]} candidates
 * @param {{ topN?: number } & import('../types.js').RoutingConfig} [options]
 * @returns {import('../types.js').ScoredCandidate[]}
 */
function recommendTopN(workOrder, candidates, options = {}) {
  const { topN = 5, ...config } = options;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  let list = candidates;
  list = filterByZip(workOrder, list, mergedConfig);
  list = filterByRadius(workOrder, list, mergedConfig);
  list = filterBySkills(workOrder, list, mergedConfig);

  const scored = scoreCandidates(workOrder, list, mergedConfig);
  scored.sort((a, b) => b.score - a.score);

  const n = Math.max(0, Math.floor(topN));
  return scored.slice(0, n);
}

module.exports = {
  normalizeZip,
  haversineMiles,
  getRequiredSkills,
  filterByZip,
  filterByRadius,
  filterBySkills,
  scoreCandidates,
  recommendTopN,
  DEFAULT_CONFIG,
};
