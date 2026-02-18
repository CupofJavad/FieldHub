# Build notes: Dana (Data & Integrations)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M4.1 More providers (Done)

- **Goal:** Add more provider mappings (OEMs, warranty, customer-pay portal). Implemented **customer_pay** (customer-pay / out-of-warranty) and **oem_vizio** (VIZIO/TPV-style OEM).
- **customer_pay** – `packages/inbound-adapters/customer-pay.js`: `mapCustomerPayToCanonical(payload)`. Accepts `external_id` or `payment_ref` or `ticket_id` or `order_id`; `name`, `address`, `phone` or full `ship_to`; `product`, `problem`, `amount_due`, `currency`. Sets `payer_type=customer_pay`, default `service_type=osr`. For customer-pay portal and out-of-warranty flows (SCT design §3.3).
- **oem_vizio** – `packages/inbound-adapters/oem-vizio.js`: `mapOemVizioToCanonical(payload)`. Same shape as oem_mock plus `order_number`, `osr_creation_date`; default brand `VIZIO`. Sets `payer_type=oem_in_warranty`. VIZIO/TPV-style OEM.
- **Registry:** Both registered in `packages/inbound-adapters` (INBOUND_MAPPERS, getMapperForProvider, getSupportedInboundProviders). Webhook `POST /webhooks/inbound/:provider_key` now supports `customer_pay` and `oem_vizio` without code changes.
- **API routes:** `POST /v1/inbound/customer_pay`, `POST /v1/inbound/oem_vizio` in apps/api/src/routes/inbound.js and server.js.
- **Ingest script:** scripts/ingest-work-orders.js detects customer_pay shape (payment_ref, or order_id + amount_due, or provider_key=customer_pay) and oem_vizio shape (order_number or provider_key=oem_vizio); POSTs to the correct endpoint.
- **Fixtures:** scripts/fixtures/m4.1-customer-pay.json, m4.1-oem-vizio.json for testing.
- **Tests:** Mapper unit test (getSupportedInboundProviders, mapCustomerPayToCanonical, mapOemVizioToCanonical) passed. API integration: started server on PORT=3002; POST /v1/inbound/customer_pay, /v1/inbound/oem_vizio, /webhooks/inbound/customer_pay return 500 when DB is down (ECONNREFUSED), 201 when DB is up. Validation: POST customer_pay with only `{"name":"X"}` returns 400 with "external_id, payment_ref, ticket_id, or order_id (string) is required".
- **Unblock (API startup):** Server was failing on missing exports. Added to work-orders.js exports: getPool, getFieldPlatforms; implemented getFieldPlatforms (returns platform_types from getAvailablePlatformTypes). Added to server.js require: postPrepareClaim, postSubmitClaim. These unblock M4.1 endpoint testing.
- **Docs:** packages/inbound-adapters README and apps/api README updated with new endpoints. CHECKLIST M4.1 and Phase4.md updated; Dana instructions updated.

---

## 2026-02-18 – M2.3 EDI / second provider / webhooks (Done)

- **Tested (this run):** Fixed server.js missing import for `postInboundExtWarrantyNew` (added to require('./routes/inbound')). Started API on PORT=3001; ran curl against POST /webhooks/inbound/ext_warranty_new (valid payload), POST /webhooks/inbound/oem_mock (valid), POST /webhooks/inbound/unknown_provider (unsupported), POST /webhooks/inbound/ext_warranty_new with invalid payload (missing auth). Results: (1)–(2) mapping and handler run; response 500 with WO_CREATE_FAILED when DB unavailable (ECONNREFUSED), 201 when DB is up. (3) 404 with body `{ error, code: WEBHOOK_INBOUND_UNSUPPORTED_PROVIDER, supported: ['oem_mock','ext_warranty_new'] }`. (4) 400 with WO_VALIDATION_FAILED and reason "external_id, auth_number, ticket_id, or claim_id (string) is required". One channel implemented and documented; tests pass for routing, validation, and error responses.
- **Implemented Option B (second provider) + Option C (inbound webhook).**
- **Second provider – ext_warranty_new:**
  - **packages/inbound-adapters/ext-warranty-new.js:** `mapExtWarrantyNewToCanonical(payload)`. Accepts auth_number, ticket_id, claim_id, auth_limit, claim_type (diag vs repair), ship_to, problem, product; sets payer_type=ext_warranty, service_type default osr; stores auth_number/claim_type in metadata, auth_limit in pricing. Returns `{ canonical }` or `{ error }`.
  - **POST /v1/inbound/ext_warranty_new** in apps/api/src/routes/inbound.js (same pattern as oem_mock).
- **Inbound webhook (Option C):**
  - **POST /webhooks/inbound/:provider_key** in apps/api/src/routes/webhooks-inbound.js. Looks up mapper via `getMapperForProvider(provider_key)`; supported: oem_mock, ext_warranty_new. Maps body to canonical, calls createWorkOrder (idempotent). Returns 201 with { id, external_id, status }; 404 if provider_key not supported (with list of supported); 400 on validation error. Uses @tgnd/logger.
  - **packages/inbound-adapters:** Added INBOUND_MAPPERS registry, getMapperForProvider(), getSupportedInboundProviders().
- **Ingest script:** scripts/ingest-work-orders.js now detects ext_warranty_new shape (auth_number, ticket_id, claim_id, or provider_key=ext_warranty_new) and POSTs to /webhooks/inbound/ext_warranty_new.
- **Docs:** API README and packages/inbound-adapters README updated. No EDI (Option A) this phase; can add 850/856 parser later in packages/inbound-adapters and register in webhook or a separate ingest script.

---

## 2026-02-18 – M1.2 One provider mapping (Done)

- **Chose Option B + batch script:** API route for provider-specific payload (aligns with “REST primary for modern providers” and future webhooks/EDI); added batch script for CSV/SFTP-style flows that call the same API.
- **Implemented:**
  - **packages/inbound-adapters:** `mapOemMockToCanonical(payload)` in oem-mock.js; accepts po_number/rma_number, ship_to, problem, model, serial, etc.; returns `{ canonical }` or `{ error }`. Uses @tgnd/canonical-model for SERVICE_TYPES.
  - **POST /v1/inbound/oem_mock** in apps/api/src/routes/inbound.js: accepts OEM-mock JSON, maps via adapter, calls createWorkOrder (db). Logging via @tgnd/logger.
  - **scripts/ingest-work-orders.js:** Reads .json (array) or .csv; for each item, if oem_mock shape (po_number, rma_number, or provider_key=oem_mock) POSTs to /v1/inbound/oem_mock, else POSTs to /v1/work-orders. Uses BASE_URL env or argv. Run from repo root: `node scripts/ingest-work-orders.js [file] [baseUrl]`.
- **Fixtures:** scripts/fixtures/work-orders.json with two sample rows (OEM mock shape).
- **Dependencies:** apps/api depends on @tgnd/inbound-adapters; inbound-adapters depends on @tgnd/canonical-model. Run `npm install` in packages/inbound-adapters and apps/api.
- **Handoff:** When DB is up, POST /v1/inbound/oem_mock and the ingest script create WOs that Sam’s assign flow (M1.5) can use. Next for Dana: M2.3 (EDI or second provider; webhooks).

---
