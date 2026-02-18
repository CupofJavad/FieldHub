/**
 * @file agents/tech-comms.js
 * M3.5: Outbound tech-communications agent – reminder rules (appointment 24h, parts delivered, cores return); draft messages.
 * Agent proposes/drafts; human approves and sends. Per SCT_AI_and_Human_Operating_Model §3.3.
 */

/**
 * Rule triggers for tech reminders.
 * @param {Object[]} workOrders - WOs with id, external_id, status, appointment_date, parts, ship_to, updated_at
 * @param {{ now?: Date, appointmentHoursAhead?: number, coresReturnDaysMin?: number }} [options]
 * @returns {{ pending_messages: Array<{ wo_id, external_id, type, to_hint, draft_content, rule }> }}
 */
function suggestTechReminders(workOrders, options = {}) {
  const now = options.now || new Date();
  const appointmentHoursAhead = options.appointmentHoursAhead ?? 24;
  const coresReturnDaysMin = options.coresReturnDaysMin ?? 14;
  const pending_messages = [];

  for (const wo of workOrders || []) {
    const appointmentDate = wo.appointment_date ? new Date(wo.appointment_date) : null;
    const updatedAt = wo.updated_at ? new Date(wo.updated_at) : null;

    // Appointment in 24h (or N hours)
    if (appointmentDate && wo.status === 'assigned') {
      const hoursUntil = (appointmentDate - now) / (60 * 60 * 1000);
      if (hoursUntil > 0 && hoursUntil <= appointmentHoursAhead) {
        pending_messages.push({
          wo_id: wo.id,
          external_id: wo.external_id,
          type: 'appointment_reminder',
          to_hint: 'tech',
          rule: `appointment_in_${appointmentHoursAhead}h`,
          draft_content: `Reminder: You have an appointment for WO ${wo.external_id || wo.id} coming up. Please confirm or contact dispatch if you need to reschedule.`,
        });
      }
    }

    // Parts delivered – need to schedule (status parts_shipped or scheduling)
    if (wo.status === 'parts_shipped' || wo.status === 'scheduling') {
      const hasParts = (wo.parts || []).some((p) => p.tracking_number || p.tracking);
      if (hasParts) {
        pending_messages.push({
          wo_id: wo.id,
          external_id: wo.external_id,
          type: 'parts_delivered_schedule',
          to_hint: 'tech',
          rule: 'parts_delivered_need_schedule',
          draft_content: `Parts for WO ${wo.external_id || wo.id} are delivered. Please schedule with the customer and confirm appointment.`,
        });
      }
    }

    // Cores return reminder (open cores 14+ days)
    const parts = wo.parts || [];
    const openCores = parts.filter((p) => (p.vendor_tail != null || p.return_expected) && !(p.return_tracking && String(p.return_tracking).trim()));
    if (wo.status === 'completed' && openCores.length && updatedAt) {
      const daysSince = Math.floor((now - updatedAt) / (24 * 60 * 60 * 1000));
      if (daysSince >= coresReturnDaysMin) {
        pending_messages.push({
          wo_id: wo.id,
          external_id: wo.external_id,
          type: 'cores_return_reminder',
          to_hint: 'tech',
          rule: `cores_return_${coresReturnDaysMin}_days`,
          draft_content: `Please return cores for WO ${wo.external_id || wo.id}. If already returned, add return tracking to the work order.`,
        });
      }
    }
  }

  return { pending_messages };
}

module.exports = {
  suggestTechReminders,
};
