/**
 * @file agents/parts-reconciliation.js
 * M3.5: Parts reconciliation agent – match tracking to WOs, suggest parts shipped/return received, flag open cores.
 * Agent proposes; human reviews/approves before master data updates. Per SCT_AI_and_Human_Operating_Model §3.1.
 */

/**
 * Suggest matches of inbound tracking to work orders (by tracking number on parts or external_id).
 * @param {Object[]} workOrders - WOs with id, external_id, parts: [{ part_number, qty, tracking_number?, return_tracking?, vendor_tail? }]
 * @param {Object[]} trackingEvents - Inbound events: [{ tracking_number, carrier?, status?: 'shipped'|'delivered'|'return_received' }]
 * @returns {{ suggestions: Array<{ type: 'parts_shipped'|'return_received', wo_id: string, part_index?: number, details: string }> }}
 */
function suggestPartsReconciliation(workOrders, trackingEvents = []) {
  const suggestions = [];
  const eventByTracking = new Map((trackingEvents || []).map((e) => [String(e.tracking_number || '').toLowerCase(), e]));

  for (const wo of workOrders || []) {
    const parts = wo.parts || [];
    parts.forEach((part, idx) => {
      const outbound = (part.tracking_number || part.tracking || '').toString().toLowerCase();
      const returnTrk = (part.return_tracking || '').toString().toLowerCase();
      if (outbound && eventByTracking.has(outbound)) {
        const ev = eventByTracking.get(outbound);
        if (ev.status === 'delivered' || ev.status === 'shipped') {
          suggestions.push({
            type: 'parts_shipped',
            wo_id: wo.id,
            part_index: idx,
            tracking_number: outbound,
            details: `Match tracking ${outbound} to WO ${wo.id} (${part.part_number || 'part'}); suggest status parts_shipped if not already.`,
          });
        }
      }
      if (returnTrk && eventByTracking.has(returnTrk)) {
        const ev = eventByTracking.get(returnTrk);
        if (ev.status === 'return_received' || ev.status === 'delivered') {
          suggestions.push({
            type: 'return_received',
            wo_id: wo.id,
            part_index: idx,
            tracking_number: returnTrk,
            details: `Match return ${returnTrk} to WO ${wo.id} (vendor tail ${part.vendor_tail ?? 'n/a'}); suggest mark return received.`,
          });
        }
      }
    });
  }

  return { suggestions };
}

/**
 * Flag open cores (parts with vendor_tail or expected return but no return_received / return_tracking not yet received).
 * @param {Object[]} workOrders
 * @param {{ openAfterDays?: number }} [options] - Flag if WO completed/updated more than N days ago (default 14)
 * @returns {{ open_cores: Array<{ wo_id, external_id, part_number, vendor_tail, details, days_open? }> }}
 */
function suggestOpenCores(workOrders, options = {}) {
  const openAfterDays = options.openAfterDays ?? 14;
  const open_cores = [];
  const now = new Date();

  for (const wo of workOrders || []) {
    const parts = wo.parts || [];
    const updatedAt = wo.updated_at ? new Date(wo.updated_at) : null;
    const daysOpen = updatedAt ? Math.floor((now - updatedAt) / (24 * 60 * 60 * 1000)) : 0;

    parts.forEach((part) => {
      const hasReturnExpected = part.vendor_tail != null || part.return_expected;
      const hasReturnTracking = !!(part.return_tracking && String(part.return_tracking).trim());
      if (hasReturnExpected && !hasReturnTracking && (wo.status === 'completed' || daysOpen >= openAfterDays)) {
        open_cores.push({
          wo_id: wo.id,
          external_id: wo.external_id,
          part_number: part.part_number || 'unknown',
          vendor_tail: part.vendor_tail,
          details: `Open core for WO ${wo.external_id || wo.id}; part ${part.part_number || 'n/a'}; consider 14–21 day reminder.`,
          days_open: wo.updated_at ? daysOpen : null,
        });
      }
    });
  }

  return { open_cores };
}

module.exports = {
  suggestPartsReconciliation,
  suggestOpenCores,
};
