/**
 * @file anomaly/alerts.js
 * M3.2: Anomaly detection – TAT breaches, stuck WOs, rejection/decline indicators.
 * Uses WO list only; no DB. Output: list of anomalies for API or dashboard.
 */

/** Result codes that indicate rejection / negative outcome (not success). */
const NEGATIVE_RESULTS = new Set([
  'no_problem_found', 'npf', 'unreachable', 'reschedule', 'defective_panel', 'denied', 'rejected', 'cancelled',
]);

function isNegativeResult(result) {
  if (result == null) return false;
  const r = String(result).toLowerCase().replace(/\s+/g, '_');
  return NEGATIVE_RESULTS.has(r) || (!r.includes('success') && r.length > 0);
}

/**
 * @param {Object[]} workOrders - WOs with id, status, requested_date_start, created_at, updated_at, completion_payload?.result
 * @param {{ tatThresholdDays?: number, stuckThresholdDays?: number }} [config]
 * @returns {Object[]} Anomalies: { type, wo_id?, provider_key?, zip?, details, severity?, count? }
 */
function detectAnomalies(workOrders, config = {}) {
  const tatThresholdDays = config.tatThresholdDays ?? 7;
  const stuckThresholdDays = config.stuckThresholdDays ?? 5;
  const now = new Date();
  const anomalies = [];

  for (const wo of workOrders || []) {
    const woId = wo.id;
    const status = wo.status;
    const updatedAt = wo.updated_at ? new Date(wo.updated_at) : null;
    const createdAt = wo.created_at ? new Date(wo.created_at) : null;
    const requestedStart = wo.requested_date_start ? new Date(wo.requested_date_start) : null;
    const completionPayload = wo.completion_payload || {};
    const result = completionPayload.result;

    // (1) TAT breach: completed WO took longer than threshold (requested → completed)
    if (status === 'completed' && requestedStart) {
      const completedAt = updatedAt || createdAt;
      if (completedAt) {
        const daysToComplete = (completedAt - requestedStart) / (24 * 60 * 60 * 1000);
        if (daysToComplete > tatThresholdDays) {
          anomalies.push({
            type: 'tat_breach',
            wo_id: woId,
            provider_key: wo.provider_key,
            details: `TAT ${Math.round(daysToComplete)} days (threshold ${tatThresholdDays})`,
            severity: 'high',
            days_to_complete: Math.round(daysToComplete),
            threshold_days: tatThresholdDays,
          });
        }
      }
    }

    // (2) Open WO at risk: requested date passed, still not completed
    if (status !== 'completed' && status !== 'cancelled' && status !== 'closed' && requestedStart) {
      if (now > requestedStart) {
        const daysOver = Math.round((now - requestedStart) / (24 * 60 * 60 * 1000));
        anomalies.push({
          type: 'tat_at_risk',
          wo_id: woId,
          provider_key: wo.provider_key,
          details: `Requested date passed ${daysOver} days ago; still ${status}`,
          severity: 'medium',
          days_over: daysOver,
        });
      }
    }

    // (3) Stuck: in scheduling or assigned for X days with no movement (by updated_at)
    if (['scheduling', 'assigned'].includes(status) && updatedAt) {
      const daysStuck = (now - updatedAt) / (24 * 60 * 60 * 1000);
      if (daysStuck >= stuckThresholdDays) {
        anomalies.push({
          type: 'stuck',
          wo_id: woId,
          provider_key: wo.provider_key,
          details: `In ${status} for ${Math.round(daysStuck)} days (threshold ${stuckThresholdDays})`,
          severity: 'medium',
          days_stuck: Math.round(daysStuck),
          threshold_days: stuckThresholdDays,
        });
      }
    }

    // (4) Rejection/negative completion: flag for aggregation (rejection rate by provider/zip)
    if (status === 'completed' && isNegativeResult(result)) {
      const zip = wo.ship_to?.zip ?? null;
      anomalies.push({
        type: 'rejection',
        wo_id: woId,
        provider_key: wo.provider_key,
        zip,
        details: `Completion result: ${result}`,
        severity: 'low',
        result: result,
      });
    }
  }

  // (5) Optional: high rejection rate by provider_key (summary)
  const byProvider = {};
  workOrders.forEach((wo) => {
    if (wo.status === 'completed') {
      const key = wo.provider_key ?? 'unknown';
      if (!byProvider[key]) byProvider[key] = { total: 0, negative: 0 };
      byProvider[key].total += 1;
      if (isNegativeResult((wo.completion_payload || {}).result)) byProvider[key].negative += 1;
    }
  });
  Object.entries(byProvider).forEach(([provider_key, { total, negative }]) => {
    if (total >= 3 && negative / total >= 0.3) {
      anomalies.push({
        type: 'rejection_spike',
        provider_key,
        details: `${Math.round((negative / total) * 100)}% negative completion rate (${negative}/${total})`,
        severity: 'medium',
        count: negative,
        total,
      });
    }
  });

  return anomalies;
}

module.exports = {
  detectAnomalies,
  isNegativeResult,
  NEGATIVE_RESULTS,
};
