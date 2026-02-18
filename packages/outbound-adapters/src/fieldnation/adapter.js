/**
 * Field Nation field platform adapter.
 * Uses official API: Create Work Order, Update Schedule, Job Status, Webhooks.
 * Docs: https://developer.fieldnation.com/client-api/webhooks/howitworks/
 *       https://developer.fieldnation.com/client-api/restapi/components/workorder_object/
 * Mock when FIELD_NATION_* credentials are missing; real mode calls FN REST API (OAuth).
 */

const { tgndToFieldNationCreatePayload, fieldNationStatusToTgnd } = require('./mapper.js');

const PLATFORM_TYPE = 'fieldnation';

/** In-memory store for mock work orders (keyed by platform_job_id). */
const mockWOs = new Map();

/**
 * Create Field Nation adapter.
 * @param {Object} options
 * @param {string} [options.baseUrl] - Field Nation API base (e.g. https://api.fieldnation.com/v2)
 * @param {string} [options.oauthToken] - OAuth token (or use env FIELD_NATION_OAUTH_TOKEN)
 * @param {boolean} [options.mock] - Force mock mode
 * @returns {import('../interface.js').IFieldPlatformAdapter}
 */
function createFieldNationAdapter(options = {}) {
  const token = options.oauthToken || process.env.FIELD_NATION_OAUTH_TOKEN;
  const useMock = options.mock !== false && !token;
  const log = options.logger || (() => {});

  return {
    async push(workOrder) {
      if (useMock) {
        const platformJobId = `fn-mock-${workOrder.id}-${Date.now()}`;
        const payload = tgndToFieldNationCreatePayload(workOrder);
        mockWOs.set(platformJobId, {
          platform_job_id: platformJobId,
          wo_id: workOrder.id,
          status: 'Published',
          created_at: new Date().toISOString(),
          fn_payload: payload,
        });
        log('info', 'Field Nation mock push', { platformJobId, wo_id: workOrder.id });
        return {
          platform_job_id: platformJobId,
          deep_link: `https://mock.fieldnation.com/workorders/${platformJobId}`,
          platform_type: PLATFORM_TYPE,
        };
      }
      // Real: POST Create Work Order with OAuth. See docs/field-mapping-fieldnation.md.
      const body = tgndToFieldNationCreatePayload(workOrder);
      const baseUrl = options.baseUrl || process.env.FIELD_NATION_API_BASE || 'https://api.fieldnation.com/v2';
      const res = await fetch(`${baseUrl}/workorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Field Nation create work order failed: ${res.status} ${errText}`);
      }
      const data = await res.json();
      const platformJobId = String(data.id ?? data.work_order_id ?? data._id);
      return {
        platform_job_id: platformJobId,
        deep_link: data.href || null,
        platform_type: PLATFORM_TYPE,
      };
    },

    async updateAppointment(platformJobId, appointmentDate) {
      if (useMock) {
        const wo = mockWOs.get(platformJobId);
        if (wo) wo.fn_payload.schedule = { service_window: { mode: 'exact', start: { utc: appointmentDate } } };
        log('info', 'Field Nation mock updateAppointment', { platformJobId, appointmentDate });
        return;
      }
      const baseUrl = options.baseUrl || process.env.FIELD_NATION_API_BASE || 'https://api.fieldnation.com/v2';
      const utc = typeof appointmentDate === 'string' ? appointmentDate : new Date(appointmentDate).toISOString().replace('T', ' ').slice(0, 19);
      const res = await fetch(`${baseUrl}/workorders/${platformJobId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_window: { mode: 'exact', start: { utc } },
          schedule_note: '',
        }),
      });
      if (!res.ok) throw new Error(`Field Nation update schedule failed: ${res.status}`);
    },

    async cancel(platformJobId, reason) {
      if (useMock) {
        const wo = mockWOs.get(platformJobId);
        if (wo) wo.status = 'Cancelled';
        log('info', 'Field Nation mock cancel', { platformJobId, reason });
        return;
      }
      const baseUrl = options.baseUrl || process.env.FIELD_NATION_API_BASE || 'https://api.fieldnation.com/v2';
      const res = await fetch(`${baseUrl}/workorders/${platformJobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled', reason: reason || '' }),
      });
      if (!res.ok) throw new Error(`Field Nation cancel failed: ${res.status}`);
    },

    async getStatus(platformJobId) {
      if (useMock) {
        const wo = mockWOs.get(platformJobId);
        if (!wo) return { platform_job_id: platformJobId, status: 'unknown' };
        return {
          platform_job_id: platformJobId,
          status: wo.status,
          completed_at: wo.completed_at,
          completion_payload: wo.completion_payload,
        };
      }
      const baseUrl = options.baseUrl || process.env.FIELD_NATION_API_BASE || 'https://api.fieldnation.com/v2';
      const res = await fetch(`${baseUrl}/workorders/${platformJobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { platform_job_id: platformJobId, status: 'unknown' };
      const data = await res.json();
      const name = data.status?.name || data.status?.display || '';
      return {
        platform_job_id: platformJobId,
        status: name,
        completed_at: data.milestones?.work_done || null,
        completion_payload: data.closing_notes ? { notes: data.closing_notes } : null,
      };
    },
  };
}

/** Mock-only: set status (simulates FN webhook). */
function mockSetStatus(platformJobId, fnStatusName, completionPayload = null) {
  const wo = mockWOs.get(platformJobId);
  if (wo) {
    wo.status = fnStatusName;
    if (fnStatusName === 'Work Done' || fnStatusName === 'completed') {
      wo.completed_at = new Date().toISOString();
      wo.completion_payload = completionPayload || {};
    }
  }
}

module.exports = {
  createFieldNationAdapter,
  mockSetStatus,
  PLATFORM_TYPE,
  fieldNationStatusToTgnd,
  tgndToFieldNationCreatePayload,
  mockWOs,
};
