/**
 * TGND canonical work order → Field Nation Create Work Order payload.
 * See docs/field-mapping-fieldnation.md and
 * https://developer.fieldnation.com/client-api/restapi/components/workorder_object/
 * https://developer.fieldnation.com/client-api/restapi/components/wo_locations/
 * https://developer.fieldnation.com/client-api/restapi/components/schedules/
 */

/**
 * @param {Object} wo - TGND canonical WO (id, problem, instructions, ship_to, appointment_date, requested_date_start, requested_date_end, service_type, product, pricing, ...)
 * @returns {Object} Field Nation Create Work Order body (title, location, schedule, description, ...)
 */
function tgndToFieldNationCreatePayload(wo) {
  const title = wo.problem || wo.instructions || `Work order ${wo.external_id || wo.id}`;
  const description = wo.instructions
    ? { html: wo.instructions }
    : wo.problem
      ? { html: wo.problem }
      : { html: '' };

  // Location: custom from ship_to (Field Nation custom location)
  const ship_to = wo.ship_to || {};
  const location = {
    mode: 'custom',
    display_name: ship_to.name || 'Site',
    address1: ship_to.address_line1 || ship_to.address1 || '',
    address2: ship_to.address_line2 || ship_to.address2 || '',
    city: ship_to.city || '',
    state: ship_to.state || '',
    zip: ship_to.zip || '',
    country: ship_to.country || 'US',
    type: { id: 1 },
  };

  // Schedule: exact (single appointment_date) or between (date range)
  let schedule;
  const appointmentDate = wo.appointment_date;
  const startReq = wo.requested_date_start;
  const endReq = wo.requested_date_end;
  const toUtc = (d) => {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().replace('T', ' ').slice(0, 19);
  };
  if (appointmentDate) {
    schedule = {
      service_window: {
        mode: 'exact',
        start: { utc: toUtc(appointmentDate) },
      },
      schedule_note: '',
    };
  } else if (startReq && endReq) {
    schedule = {
      service_window: {
        mode: 'between',
        start: { utc: toUtc(startReq) },
        end: { utc: toUtc(endReq) },
      },
      schedule_option: 0,
      schedule_note: '',
    };
  } else {
    schedule = {
      service_window: {
        mode: 'exact',
        start: { utc: toUtc(new Date()) },
      },
      schedule_note: '',
    };
  }

  return {
    title,
    description,
    location,
    schedule,
    require_gps: false,
  };
}

/**
 * Map Field Nation status.name to TGND status (for webhook handler).
 * @param {string} fnStatusName - e.g. Draft, Published, Assigned, Work Done, Cancelled
 * @returns {string} TGND status
 */
function fieldNationStatusToTgnd(fnStatusName) {
  const name = (fnStatusName || '').toLowerCase();
  if (name === 'draft' || name === 'routed' || name === 'published') return 'scheduling';
  if (name === 'assigned' || name.includes('checked in') || name === 'confirmed' || name.includes('on the way')) return 'in_progress';
  if (name === 'work done' || name === 'approved' || name === 'paid') return 'completed';
  if (name === 'cancelled' || name === 'deleted' || name.includes('postponed')) return 'cancelled';
  return 'assigned';
}

module.exports = { tgndToFieldNationCreatePayload, fieldNationStatusToTgnd };
