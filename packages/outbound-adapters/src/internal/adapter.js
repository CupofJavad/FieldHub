/**
 * Internal pool adapter (M4.2).
 * Assigns WO to "internal" pool without pushing to an external platform.
 * Use for in-house techs or when operator will assign manually; platform_job_id = internal-{wo_id}.
 */

const PLATFORM_TYPE = 'internal';

const internalJobs = new Map();

function createInternalAdapter(options = {}) {
  const log = options.logger || (() => {});

  return {
    async push(workOrder) {
      const platformJobId = `internal-${workOrder.id}`;
      internalJobs.set(platformJobId, {
        platform_job_id: platformJobId,
        wo_id: workOrder.id,
        status: 'assigned',
        created_at: new Date().toISOString(),
      });
      log('info', 'Internal pool assign', { platformJobId, wo_id: workOrder.id });
      return {
        platform_job_id: platformJobId,
        deep_link: null,
        platform_type: PLATFORM_TYPE,
      };
    },

    async updateAppointment(platformJobId, appointmentDate) {
      const job = internalJobs.get(platformJobId);
      if (job) job.appointment_date = appointmentDate;
      log('info', 'Internal pool updateAppointment', { platformJobId, appointmentDate });
    },

    async cancel(platformJobId, reason) {
      const job = internalJobs.get(platformJobId);
      if (job) job.status = 'cancelled';
      log('info', 'Internal pool cancel', { platformJobId, reason });
    },

    async getStatus(platformJobId) {
      const job = internalJobs.get(platformJobId);
      if (!job) return { platform_job_id: platformJobId, status: 'unknown' };
      return {
        platform_job_id: platformJobId,
        status: job.status,
        completed_at: job.completed_at,
        completion_payload: job.completion_payload,
      };
    },
  };
}

module.exports = { createInternalAdapter, PLATFORM_TYPE };
