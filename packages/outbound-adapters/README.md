# @tgnd/outbound-adapters

Field platform adapters for TGND: push work orders to on-demand field-tech platforms (WorkMarket, Field Nation, etc.), store `platform_job_id`, and sync status back.

**M1.4:** One field platform adapter (WorkMarket): push job, `platform_job_id`, status sync.

---

## Interface

All adapters implement:

| Method | Description |
|--------|-------------|
| `push(workOrder)` | Push WO to platform; returns `{ platform_job_id, deep_link?, platform_type }`. Caller stores `platform_job_id` on the WO. |
| `updateAppointment(platformJobId, appointmentDate)` | Update appointment on platform. |
| `cancel(platformJobId, reason?)` | Cancel job on platform. |
| `getStatus(platformJobId)` | Poll status (fallback when webhooks unavailable); returns `{ platform_job_id, status, completed_at?, completion_payload? }`. |

Work order shape for `push`: at least `id`; recommended `external_id`, `status`, `ship_to` (address), `requested_date_start`/`end`, `appointment_date`, `problem`, `instructions`. See `src/types.js` (JSDoc).

---

## WorkMarket adapter

- **Create:** `createWorkMarketAdapter(options)`
  - `options.apiKey` – WorkMarket API key (use env `WORKMARKET_API_KEY`; do not commit).
  - `options.baseUrl` – Optional API base URL.
  - `options.mock` – If `true`, or if `apiKey` is missing, uses in-memory mock (no real API calls).
  - `options.logger` – Optional `(level, message, context)` logger.

- **Mock mode:** Default when no API key. Push returns a synthetic `platform_job_id`; `getStatus` returns in-memory state. Use `mockSetStatus(platformJobId, status, completionPayload?)` in tests or stub webhooks to simulate “completed” etc.

---

## Status sync (webhook contract)

Platforms can send status updates (accepted, completed, rescheduled, cancelled) to TGND. Prefer **webhooks** from the platform; if unavailable, poll with `getStatus`.

**Contract for API (Corey / apps/api):**

- **POST** `/webhooks/field/:platform`  
  - `:platform` = e.g. `workmarket`, `fieldnation`.
  - Body: platform-specific payload. Verify signature if the platform provides one.
  - Handler should: parse → map to canonical completion payload and WO lifecycle (e.g. status → Completed) → update WO in DB → optionally publish internal event.
  - Return 200 quickly; process async (queue-first, idempotent) if needed.

Store `platform_job_id` and `platform_type` on the work order so callbacks can be correlated.

---

## Usage

```js
const { createWorkMarketAdapter } = require('@tgnd/outbound-adapters');

const adapter = createWorkMarketAdapter({
  apiKey: process.env.WORKMARKET_API_KEY,  // omit for mock
  logger: (level, msg, ctx) => console.log(level, msg, ctx),
});

const result = await adapter.push(workOrder);
// result.platform_job_id → store on WO
// result.platform_type === 'workmarket'

const status = await adapter.getStatus(result.platform_job_id);
```

---

## Retry and reliability

- **Outbound push:** Retry with backoff if push fails; keep WO in a “pending_push” state and reprocess.
- **Inbound (webhook):** Verify signature; enqueue; update WO and publish internal events; use dead-letter for failures.

See `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md` §5 (Outbound).
