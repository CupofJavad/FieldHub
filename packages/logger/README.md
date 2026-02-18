# @tgnd/logger

Structured JSON logger for TGND API, workers, and portal. Design: `docs/ERROR_LOGGING_SYSTEM.md`. Schema: `tools/error-logging/log-entry.schema.json`.

## Usage

```js
const { createLogger } = require('@tgnd/logger');

const log = createLogger('api'); // service: api | workers | portal

log.info('Work order received', null, { provider_key: 'oem_vizio', external_id: 'PO-123' });
log.error('Validation failed', 'WO_VALIDATION_FAILED', { reason: 'missing ship_to' });
log.warn('Retry attempt', 'EDI_PARSE_WARN', { segment: 'N1' });
log.debug('Payload', null, { size: 1024 });
```

## Options

- **service** (required): `'api'` | `'workers'` | `'portal'`
- **requestId** / **jobId**: set for the lifetime of the logger (e.g. per-request or per-job)
- **logLevel**: override env; one of `ERROR`, `WARN`, `INFO`, `DEBUG`
- **destination**: `'stdout'` (default) or `'stderr'`
- **errorDestination**: where ERROR level goes (default: stderr)

## Environment

- **LOG_LEVEL**: minimum level to emit (default: `INFO`). Set to `DEBUG` in dev.

## Child loggers

Use `log.child({ requestId: 'req-xyz', jobId: 'job-1' })` for request- or job-scoped logging without creating a new base logger.

## Codes

Use project prefixes: `TGND_`, `WO_`, `EDI_`, `ADAPTER_` (e.g. `WO_VALIDATION_FAILED`, `EDI_PARSE_ERROR`). See design doc.

## No secrets

Do not log passwords, tokens, or full request bodies; log redacted identifiers only.
