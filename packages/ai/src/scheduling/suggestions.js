/**
 * @file scheduling/suggestions.js
 * M3.2: Scheduling suggestions – ready-to-schedule list and suggested appointment windows.
 * Human decides; AI suggests. Consumed by Report Center or GET /v1/ai/scheduling-suggestions.
 */

/**
 * WO has requested_date_start/end, appointment_date, status. "Ready to schedule" = needs appointment set.
 * @param {Object[]} workOrders - List of WOs (each: id, status, requested_date_start, requested_date_end, appointment_date, ship_to, service_type)
 * @param {{ statuses?: string[] }} [options] - Statuses that count as "ready to schedule" (default: scheduling, parts_shipped)
 * @returns {{ ready: Object[], suggested_slots?: Array<{ start: string, end: string, label?: string }> }}
 */
function getReadyToSchedule(workOrders, options = {}) {
  const statuses = options.statuses ?? ['scheduling', 'parts_shipped'];
  const ready = (workOrders || []).filter(
    (wo) => statuses.includes(wo.status) && !wo.appointment_date
  );
  return { ready };
}

/**
 * Suggest next N appointment date windows (date-only) for a WO based on requested_date_start/end.
 * If WO has requested window, suggest slots inside it; otherwise suggest next weekdays.
 * @param {Object} workOrder - WO with requested_date_start, requested_date_end (ISO date)
 * @param {{ slotsCount?: number, slotDurationDays?: number }} [options]
 * @returns {Array<{ date: string, label: string }>} Suggested dates (ISO YYYY-MM-DD)
 */
function suggestAppointmentWindows(workOrder, options = {}) {
  const count = options.slotsCount ?? 5;
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reqStart = workOrder.requested_date_start ? new Date(workOrder.requested_date_start) : null;
  const reqEnd = workOrder.requested_date_end ? new Date(workOrder.requested_date_end) : null;

  if (reqStart) reqStart.setHours(0, 0, 0, 0);
  if (reqEnd) reqEnd.setHours(0, 0, 0, 0);

  let cursor = reqStart && reqStart >= today ? reqStart : today;
  if (reqEnd && cursor > reqEnd) return slots;

  const maxIterations = 60;
  let iter = 0;
  while (slots.length < count && iter++ < maxIterations) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const dateStr = cursor.toISOString().slice(0, 10);
      slots.push({ date: dateStr, label: dateStr });
    }
    cursor.setDate(cursor.getDate() + 1);
    if (reqEnd && cursor > reqEnd) break;
  }

  return slots;
}

/**
 * Combined: ready-to-schedule list plus suggested windows for a single WO (e.g. for ?wo_id=).
 * @param {Object[]} workOrders - All WOs (or single WO) to filter "ready"
 * @param {Object} [singleWo] - If provided, suggest windows for this WO
 * @param {{ statuses?: string[], slotsCount?: number }} [options]
 */
function getSchedulingSuggestions(workOrders, singleWo = null, options = {}) {
  const list = Array.isArray(workOrders) ? workOrders : [workOrders].filter(Boolean);
  const { ready } = getReadyToSchedule(list, options);
  const suggested_slots = singleWo ? suggestAppointmentWindows(singleWo, { slotsCount: options.slotsCount ?? 5 }) : null;
  return {
    ready,
    suggested_slots: suggested_slots ?? undefined,
  };
}

module.exports = {
  getReadyToSchedule,
  suggestAppointmentWindows,
  getSchedulingSuggestions,
};
