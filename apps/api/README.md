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
| POST | /v1/work-orders/:id/assign | Assign WO to field platform (WorkMarket); sets status=assigned, platform_job_id, platform_type |
| POST | /webhooks/field/workmarket | Field platform webhook: body { platform_job_id, status [, completion_payload ] }; updates WO to completed when status=completed |

Uses `@tgnd/logger` and `@tgnd/canonical-model` (see docs and SCT_Enhanced_System_Design_And_Build_Scope.md).
