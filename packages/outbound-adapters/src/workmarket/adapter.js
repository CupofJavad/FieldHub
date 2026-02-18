/**
 * @file adapter.js
 * WorkMarket field platform adapter.
 * API: https://employer-api.workmarket.com/reference/getting-started
 * - Create Access Token (POST), Create Assignment (POST), Edit Assignment, Send Assignment, Cancel Assignment, Get Assignment.
 * Field mapping: docs/field-mapping-workmarket.md
 */

const PLATFORM_TYPE = 'workmarket';

/** In-memory store for mock jobs (keyed by platform_job_id). Replace with API calls in production. */
const mockJobs = new Map();

/** Build minimal assignment body from TGND WO for WorkMarket Create Assignment. Confirm fields at employer-api.workmarket.com. */
function tgndToWorkMarketAssignmentBody(workOrder) {
  const ship_to = workOrder.ship_to || {};
  return {
    title: workOrder.problem || workOrder.instructions || `WO ${workOrder.external_id || workOrder.id}`,
    description: workOrder.instructions || workOrder.problem || '',
    location: {
      addressLine1: ship_to.address_line1 || ship_to.address1,
      city: ship_to.city,
      state: ship_to.state,
      postalCode: ship_to.zip,
      country: ship_to.country || 'US',
    },
    scheduledDate: workOrder.appointment_date || workOrder.requested_date_start,
    // Add other required/optional fields per WorkMarket API reference (e.g. budget, custom fields).
  };
}

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
  const apiKey = options.apiKey || process.env.WORKMARKET_API_KEY;
  const useMock = options.mock !== false && !apiKey;
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
      const baseUrl = (options.baseUrl || process.env.WORKMARKET_API_BASE || 'https://employer-api.workmarket.com').replace(/\/$/, '');
      const apiKey = options.apiKey || process.env.WORKMARKET_API_KEY;
      if (!apiKey) throw new Error('WorkMarket API requires apiKey in options or env WORKMARKET_API_KEY');
      const tokenRes = await fetch(`${baseUrl}/api/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });
      if (!tokenRes.ok) throw new Error(`WorkMarket token failed: ${tokenRes.status}`);
      const { access_token } = await tokenRes.json();
      const body = tgndToWorkMarketAssignmentBody(workOrder);
      const createRes = await fetch(`${baseUrl}/api/v1/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(body),
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`WorkMarket create assignment failed: ${createRes.status} ${errText}`);
      }
      const data = await createRes.json();
      const platformJobId = String(data.id ?? data.assignment_id ?? data.assignmentId ?? data._id);
      return {
        platform_job_id: platformJobId,
        deep_link: data.deep_link ?? data.url ?? null,
        platform_type: PLATFORM_TYPE,
      };
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
      const baseUrl = (options.baseUrl || process.env.WORKMARKET_API_BASE || 'https://employer-api.workmarket.com').replace(/\/$/, '');
      const apiKey = options.apiKey || process.env.WORKMARKET_API_KEY;
      if (!apiKey) throw new Error('WorkMarket API requires apiKey');
      const tokenRes = await fetch(`${baseUrl}/api/v1/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: apiKey }) });
      const { access_token } = await tokenRes.json();
      await fetch(`${baseUrl}/api/v1/assignments/${platformJobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({ scheduledDate: appointmentDate }),
      });
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
      const baseUrl = (options.baseUrl || process.env.WORKMARKET_API_BASE || 'https://employer-api.workmarket.com').replace(/\/$/, '');
      const apiKey = options.apiKey || process.env.WORKMARKET_API_KEY;
      if (!apiKey) throw new Error('WorkMarket API requires apiKey');
      const tokenRes = await fetch(`${baseUrl}/api/v1/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: apiKey }) });
      const { access_token } = await tokenRes.json();
      const cancelRes = await fetch(`${baseUrl}/api/v1/assignments/${platformJobId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({ reason: reason || '' }),
      });
      if (!cancelRes.ok) throw new Error(`WorkMarket cancel failed: ${cancelRes.status}`);
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
      const baseUrl = (options.baseUrl || process.env.WORKMARKET_API_BASE || 'https://employer-api.workmarket.com').replace(/\/$/, '');
      const apiKey = options.apiKey || process.env.WORKMARKET_API_KEY;
      if (!apiKey) throw new Error('WorkMarket API requires apiKey');
      const tokenRes = await fetch(`${baseUrl}/api/v1/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: apiKey }) });
      const { access_token } = await tokenRes.json();
      const getRes = await fetch(`${baseUrl}/api/v1/assignments/${platformJobId}`, { headers: { Authorization: `Bearer ${access_token}` } });
      if (!getRes.ok) return { platform_job_id: platformJobId, status: 'unknown' };
      const data = await getRes.json();
      return {
        platform_job_id: platformJobId,
        status: (data.status || data.state || 'unknown').toLowerCase(),
        completed_at: data.completed_at ?? data.completedAt ?? null,
        completion_payload: data.completion_payload ?? null,
      };
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
