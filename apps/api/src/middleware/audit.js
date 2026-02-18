/**
 * M4.4 – Audit log middleware. Call recordAudit() after critical actions (from route handlers).
 * This module exposes a helper that route handlers use; we don't middleware every request.
 */
const { insertAuditLog } = require('../db');

async function recordAudit(req, entry) {
  const requestId = req && req.id;
  try {
    await insertAuditLog({
      ...entry,
      request_id: requestId,
    });
  } catch (err) {
    try {
      const { createLogger } = require('@tgnd/logger');
      createLogger('api').warn('audit_log_failed', null, { error: err.message });
    } catch (_) {}
  }
}

module.exports = { recordAudit };
