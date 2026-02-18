# Build notes: Dana (Data & Integrations)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

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
