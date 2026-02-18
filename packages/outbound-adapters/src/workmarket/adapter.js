/**
 * @file adapter.js
 * WorkMarket field platform adapter.
 * M1.4: push job, platform_job_id, status sync.
 * This implementation is a MOCK for development; replace with real WorkMarket API when credentials are available.
 */

const { IFieldPlatformAdapter } = require('../interface.js');

const PLATFORM_TYPE = 'workmarket';

/** In-memory store for mock jobs (keyed by platform_job_id). Replace with API calls in production. */
const mockJobs = new Map();

/**
 * Create WorkMarket adapter. Options: { baseUrl?, apiKey?, mock?: boolean }.
 * If mock is true or apiKey is missing, uses in-memory mock.
 * @param {Object} options
 * @param {string} [options.baseUrl] - WorkMarket API base URL
 * @param {string} [options.apiKey] - API key (do not commit; use env)
 * @param {boolean} [options.mock] - Force mock mode
 * @returns {IFieldPlatformAdapter}
 */
function createWorkMarketAdapter(options = {}) {
  const useMock = options.mock !== false && !options.apiKey;
  const log = options.logger || (() => {});

  return {
    async push(workOrder) {
      if (useMock) {
        const platformJobId = `wm-mock-${workOrder.id}-${Date.now()}`;
        mockJobs.set(platformJobId, {
          platform_job_id: platformJobId,
          wo_id: workOrder.id,
          status: 'open',
          created_at: new Date().toISOString(),
          ship_to: workOrder.ship_to,
          appointment_date: workOrder.appointment_date,
        });
        log('info', 'WorkMarket mock push', { platformJobId, wo_id: workOrder.id });
        return {
          platform_job_id: platformJobId,
          deep_link: `https://mock.workmarket.com/job/${platformJobId}`,
          platform_type: PLATFORM_TYPE,
        };
      }
      // TODO: real WorkMarket API POST when credentials available
      throw new Error('WorkMarket API requires apiKey in options or env WORKMARKET_API_KEY');
    },

    async updateAppointment(platformJobId, appointmentDate) {
      if (useMock) {
        const job = mockJobs.get(platformJobId);
        if (job) {
          job.appointment_date = appointmentDate;
          job.updated_at = new Date().toISOString();
        }
        log('info', 'WorkMarket mock updateAppointment', { platformJobId, appointmentDate });
        return;
      }
      throw new Error('WorkMarket API requires apiKey');
    },

    async cancel(platformJobId, reason) {
      if (useMock) {
        const job = mockJobs.get(platformJobId);
        if (job) {
          job.status = 'cancelled';
          job.cancelled_at = new Date().toISOString();
          job.cancel_reason = reason;
        }
        log('info', 'WorkMarket mock cancel', { platformJobId, reason });
        return;
      }
      throw new Error('WorkMarket API requires apiKey');
    },

    async getStatus(platformJobId) {
      if (useMock) {
        const job = mockJobs.get(platformJobId);
        if (!job) {
          return { platform_job_id: platformJobId, status: 'unknown' };
        }
        return {
          platform_job_id: platformJobId,
          status: job.status,
          completed_at: job.completed_at,
          completion_payload: job.completion_payload,
        };
      }
      throw new Error('WorkMarket API requires apiKey');
    },
  };
}

/**
 * Mock-only: set status for a job (simulates platform webhook "completed").
 * Used by tests or by a stub webhook handler that updates WO lifecycle.
 * @param {string} platformJobId
 * @param {string} status - open | assigned | in_progress | completed | cancelled
 * @param {Object} [completionPayload]
 */
function mockSetStatus(platformJobId, status, completionPayload = null) {
  const job = mockJobs.get(platformJobId);
  if (job) {
    job.status = status;
    job.updated_at = new Date().toISOString();
    if (status === 'completed') {
      job.completed_at = job.updated_at;
      job.completion_payload = completionPayload || { result: 'success' };
    }
  }
}

module.exports = { createWorkMarketAdapter, mockSetStatus, PLATFORM_TYPE, mockJobs };
