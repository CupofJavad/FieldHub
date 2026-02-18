/**
 * @file interface.js
 * Field platform adapter interface (per SCT Enhanced System Design §5.2).
 * Implementations: WorkMarket, Field Nation, etc.
 */

/**
 * @typedef {import('./types.js').WorkOrderForPush} WorkOrderForPush
 * @typedef {import('./types.js').PushResult} PushResult
 * @typedef {import('./types.js').PlatformStatus} PlatformStatus
 */

/**
 * @interface IFieldPlatformAdapter
 * Generic outbound adapter: push job, update appointment, cancel, get status.
 */
class IFieldPlatformAdapter {
  /**
   * Push a work order to the field platform. Store platform_job_id on the WO in caller's DB.
   * @param {WorkOrderForPush} workOrder - Canonical WO (or minimal shape)
   * @returns {Promise<PushResult>} platform_job_id and optional deep_link, platform_type
   */
  async push(workOrder) {
    throw new Error('Adapter must implement push(workOrder)');
  }

  /**
   * Update appointment date on the platform.
   * @param {string} platformJobId
   * @param {string} appointmentDate - ISO datetime
   * @returns {Promise<void>}
   */
  async updateAppointment(platformJobId, appointmentDate) {
    throw new Error('Adapter must implement updateAppointment(platformJobId, appointmentDate)');
  }

  /**
   * Cancel the job on the platform.
   * @param {string} platformJobId
   * @param {string} [reason]
   * @returns {Promise<void>}
   */
  async cancel(platformJobId, reason) {
    throw new Error('Adapter must implement cancel(platformJobId, reason)');
  }

  /**
   * Get current status (polling fallback when webhooks are unavailable).
   * @param {string} platformJobId
   * @returns {Promise<PlatformStatus>}
   */
  async getStatus(platformJobId) {
    throw new Error('Adapter must implement getStatus(platformJobId)');
  }
}

module.exports = { IFieldPlatformAdapter };
