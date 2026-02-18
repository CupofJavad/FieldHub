# TGND Advanced Error Logging System

**Purpose:** Structured, consistent error logging across API, workers, and portal for debugging, monitoring, and alerting.

---

## 1. Principles

- **Structured logs:** JSON format in production (e.g. `{"level","message","code","context","timestamp"}`).
- **Levels:** ERROR, WARN, INFO, DEBUG. LOG_LEVEL from env controls minimum level.
- **Context:** Every log entry SHOULD include: `service` (api|workers|portal), `requestId` or `jobId` when available, `userId` or `provider_key` when relevant, and optional `stack` for errors.
- **No secrets:** Never log passwords, tokens, or full request bodies; log redacted identifiers only.
- **Destination:** Stdout/stderr for containers; optional file rotation under `logs/` (e.g. `logs/app.log`, `logs/error.log`). Ensure `logs/*` is in `.gitignore` except for README or placeholder.

---

## 2. Schema (Structured Entry)

```json
{
  "timestamp": "2026-02-17T14:30:22.123Z",
  "level": "ERROR",
  "message": "Work order creation failed",
  "code": "WO_VALIDATION_FAILED",
  "service": "api",
  "requestId": "req-abc123",
  "context": {
    "provider_key": "oem_vizio",
    "external_id": "PO-12345",
    "reason": "missing ship_to"
  },
  "stack": "Optional stack trace for errors"
}
```

**Codes:** Project-specific prefix `TGND_` or `WO_`, `EDI_`, `ADAPTER_` etc. (e.g. `WO_VALIDATION_FAILED`, `EDI_PARSE_ERROR`, `ADAPTER_WORKMARKET_PUSH_FAILED`).

---

## 3. Where to Log

| Component | Log location / stream |
|-----------|------------------------|
| API | stdout (JSON); optional `logs/api.log` |
| Workers | stdout (JSON); optional `logs/workers.log` |
| Portal | Browser console for dev; server-side to stdout or `logs/portal.log` |
| Errors only | Optional `logs/error.log` (all services) or per-service |

---

## 4. Implementation

- **Shared package:** `packages/logger` – createLogger(service, options) returning a logger that emits the schema above.
- **Integration:** API and workers use `packages/logger`; portal uses same or a thin client that sends to API for server-side logs.
- **Rotation:** Use a process manager or log agent (e.g. logrotate, Docker logging driver) to rotate files; keep paths and retention in `config/` or env.

---

## 5. Alerting (Future)

- **Critical:** Errors with code in a “critical” list (e.g. DB connection, payment) can trigger alerts (email, Slack) when implemented.
- **Anomaly:** Morgan’s anomaly layer can consume logs or metrics derived from logs.

---

*Implement `packages/logger` in Phase 1; wire into API and workers as they are built.*
