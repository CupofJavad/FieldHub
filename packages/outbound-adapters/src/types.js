/**
 * @file types.js
 * Minimal work order shape for outbound adapters (input).
 * When packages/canonical-model exists, use that; this keeps the adapter decoupled until then.
 *
 * @typedef {Object} ShipToAddress
 * @property {string} [address_line1]
 * @property {string} [address_line2]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [zip]
 * @property {string} [phone]
 * @property {string} [name]
 *
 * @typedef {Object} WorkOrderForPush
 * @property {string} id - Internal WO id (UUID or string)
 * @property {string} [external_id] - Provider reference
 * @property {string} [status] - received | parts_ordered | parts_shipped | scheduling | assigned | completed | cancelled
 * @property {string} [service_type] - osr | oss_last_mile | installation | depot_repair | etc.
 * @property {string} [problem]
 * @property {string} [instructions]
 * @property {ShipToAddress} [ship_to]
 * @property {string} [requested_date_start] - ISO date
 * @property {string} [requested_date_end] - ISO date
 * @property {string} [appointment_date] - ISO datetime
 * @property {Object} [product] - brand, model, serial
 * @property {Object} [pricing] - labor, parts, auth limit, currency
 * @property {Object} [metadata]
 *
 * @typedef {Object} PushResult
 * @property {string} platform_job_id - Id on the field platform
 * @property {string} [deep_link] - Optional URL for portal
 * @property {string} [platform_type] - e.g. 'workmarket'
 *
 * @typedef {Object} PlatformStatus
 * @property {string} platform_job_id
 * @property {string} status - e.g. open | assigned | in_progress | completed | cancelled
 * @property {string} [completed_at] - ISO datetime when completed
 * @property {Object} [completion_payload] - result, parts_used, unit_condition, return_tracking, etc.
 */

module.exports = {};
