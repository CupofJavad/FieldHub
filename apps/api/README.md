# TGND API (M1.1)

REST API for work orders: POST/GET/PATCH `/v1/work-orders`. Idempotency by `provider_key` + `external_id`. Lifecycle enforced on PATCH.

## Setup

- Set `DATABASE_URL` in repo root `.env` (e.g. `postgresql://user:pass@localhost:5432/tgnd`).
- From repo root, run migration once:
  ```bash
  node apps/api/scripts/run-migration.js
  ```
- Install and start:
  ```bash
  cd apps/api && npm install && npm start
  ```
- Port: `PORT` env or 3000.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/work-orders | Create or upsert WO (body: external_id, provider_key, payer_type, service_type, …) |
| POST | /v1/inbound/oem_mock | Provider-specific: OEM mock JSON → map to canonical → create WO (po_number/rma_number, ship_to, problem, …) |
| POST | /v1/inbound/ext_warranty_new | Provider-specific: Extended warranty (NEW-style) JSON → map → create (auth_number, auth_limit, ship_to, …) |
| POST | /webhooks/inbound/:provider_key | Inbound webhook: provider sends payload; map by provider_key (oem_mock, ext_warranty_new) → create/upsert WO |
| GET | /v1/work-orders/:id | Get by internal id |
| GET | /v1/work-orders?provider=&external_id= | Get by provider + external_id |
| PATCH | /v1/work-orders/:id | Update status/fields; lifecycle transitions enforced |
| POST | /v1/work-orders/:id/assign | Assign WO to field platform. Optional `?platform_type=workmarket\|fieldnation` or body `{ platform_type }`; default workmarket. Sets status=assigned, platform_job_id, platform_type. |
| POST | /webhooks/field/workmarket | Field platform webhook: body { platform_job_id, status [, completion_payload ] }; updates WO to completed when status=completed |
| POST | /webhooks/field/fieldnation | Field Nation webhook: body { platform_job_id or work_order_id, status (e.g. Work Done) [, completion_payload ] }. See `docs/WEBHOOK_FIELD_NATION_SPEC.md`. |
| GET | /v1/ai/scheduling-suggestions | M3.2: Ready-to-schedule WOs + optional suggested_slots for ?wo_id=; query: wo_id, statuses, slots_count |
| GET | /v1/ai/anomalies | M3.2: Anomaly list (TAT breach, at-risk, stuck, rejection, rejection_spike); query: tat_threshold_days, stuck_threshold_days, status, provider_key, date_from, date_to |
| POST | /v1/ai/extract-notes | M3.3: Extract WO fields from notes. Body: `{ "text": "…" }`. Returns `{ suggested_wo_fields, error? }`. Requires OPENAI_API_KEY in env. Human reviews then POST /v1/work-orders. |
| POST | /v1/ai/dispatch-parse | M3.4: Parse utterance → intent, entities, suggested_actions. Body: `{ "utterance": "…" }`. Human confirms before executing suggested API calls. See packages/ai dispatch SUPPORTED_PHRASES.md. |
| POST | /v1/ai/agents/parts/suggest | M3.5: Parts reconciliation – body `{ work_orders, tracking_events?, open_after_days? }` → suggestions + open_cores. Human approves before apply. |
| POST | /v1/ai/agents/claims/prepare | M3.5: Claim prepare – body `{ work_order }` → proposed_claim, ready_for_submit. Human submits. |
| POST | /v1/ai/agents/tech-comms/suggest | M3.5: Tech reminders – body `{ work_orders, options? }` → pending_messages (draft_content). Human approves before send. |

Uses `@tgnd/logger` and `@tgnd/canonical-model` (see docs and SCT_Enhanced_System_Design_And_Build_Scope.md).
