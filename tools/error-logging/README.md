# TGND Error Logging

See `docs/ERROR_LOGGING_SYSTEM.md` for the full design.

**Implementation:** Shared logger lives in `packages/logger`. This directory holds:

- **Schema:** Reference JSON schema for log entries (optional `log-entry.schema.json`).
- **Scripts:** Any one-off analysis or log-aggregation scripts (optional).

API, workers, and portal should use `packages/logger` for consistent structured logs.
