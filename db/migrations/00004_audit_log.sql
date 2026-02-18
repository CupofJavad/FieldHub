-- M4.4 – Audit log for critical API actions (WO create/update/assign, webhooks)
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  action     TEXT NOT NULL,
  resource   TEXT NOT NULL,
  resource_id TEXT,
  actor      TEXT,
  details    JSONB DEFAULT '{}',
  request_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log (at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log (resource, resource_id);
