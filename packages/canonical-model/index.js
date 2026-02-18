/**
 * @tgnd/canonical-model
 * Canonical work order enums and lifecycle (see SCT_Enhanced_System_Design_And_Build_Scope.md §3.1, §4.2)
 */

const PAYER_TYPES = Object.freeze([
  'oem_in_warranty',
  'ext_warranty',
  'customer_pay',
]);

const SERVICE_TYPES = Object.freeze([
  'osr',
  'oss_last_mile',
  'installation',
  'depot_repair',
  'inspection',
]);

const WO_STATUS = Object.freeze([
  'received',
  'parts_ordered',
  'parts_shipped',
  'scheduling',
  'assigned',
  'in_progress',
  'completed',
  'closed',
  'cancelled',
]);

/** Valid next statuses from current (lifecycle state machine) */
const TRANSITIONS = Object.freeze({
  received: ['parts_ordered', 'parts_shipped', 'scheduling', 'cancelled'],
  parts_ordered: ['parts_shipped', 'scheduling', 'cancelled'],
  parts_shipped: ['scheduling', 'assigned', 'cancelled'],
  scheduling: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['closed'],
  closed: [],
  cancelled: [],
});

function canTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

function isTerminal(status) {
  return status === 'closed' || status === 'cancelled';
}

module.exports = {
  PAYER_TYPES,
  SERVICE_TYPES,
  WO_STATUS,
  TRANSITIONS,
  canTransition,
  isTerminal,
};
