# Phase 1 – M1.2 & M1.5 Handoff (Dana & Sam)

**Purpose:** Clear spec so **Dana** (M1.2 provider mapping) and **Sam** (M1.5 end-to-end) can implement without blocking each other. API and DB are in place (Corey: M1.1, M1.3).

---

## 1. API contract (Corey’s API – use as-is)

**Base URL:** `http://localhost:<PORT>` (see `apps/api`; port from env).

### POST /v1/work-orders (create or upsert; idempotent by provider_key + external_id)

**Required body fields:**

- `external_id` (string) – Provider’s reference (e.g. PO, RMA).
- `provider_key` (string) – e.g. `oem_mock`, `oem_vizio`, `ext_warranty_new`.
- `payer_type` (string) – One of: `oem_in_warranty` | `ext_warranty` | `customer_pay`.
- `service_type` (string) – One of: `osr` | `oss_last_mile` | `installation` | `depot_repair` | `inspection`.

**Optional:** `status`, `product`, `problem`, `instructions`, `ship_to`, `requested_date_start`, `requested_date_end`, `appointment_date`, `parts`, `pricing`, `metadata`. See `packages/canonical-model` and `apps/api/src/routes/work-orders.js`.

**Example:**

```json
{
  "external_id": "PO-2026-001",
  "provider_key": "oem_mock",
  "payer_type": "oem_in_warranty",
  "service_type": "osr",
  "problem": "No power",
  "ship_to": { "name": "Jane Doe", "address_line1": "123 Main St", "city": "Sacramento", "state": "CA", "zip": "95814", "phone": "555-1234" }
}
```

**Response:** 201 or 200 with `{ id, external_id, provider_key, status, ... }`.

### GET /v1/work-orders/:id

Returns one WO by internal UUID.

### GET /v1/work-orders?provider=oem_mock&external_id=PO-2026-001

Returns one WO by provider_key + external_id.

### PATCH /v1/work-orders/:id

Body: `status` and/or other updatable fields. Lifecycle transitions enforced (see `@tgnd/canonical-model` TRANSITIONS).

---

## 2. M1.2 – Dana: One provider mapping

**Goal:** At least one way for a “provider” to create work orders in the system (mock or real).

**Options (pick one or both):**

- **A. Mock OEM script:** A script (e.g. `packages/inbound-adapters` or `scripts/`) that reads a CSV or JSON file and calls `POST /v1/work-orders` for each row (mapping columns to canonical fields). Use `@tgnd/logger`.
- **B. Mock OEM API route:** An HTTP endpoint (e.g. under `apps/api`) that accepts a provider-specific JSON payload, maps it to the canonical body above, and calls the same create logic (or forwards to POST /v1/work-orders internally).

**Deliverables:**

- Map provider payload → canonical (external_id, provider_key, payer_type, service_type, ship_to, problem, etc.).
- Call or invoke the API so WOs appear in the DB.
- Use `packages/logger` for logging.
- Document in `agents/live/build-notes/Dana.md` and update `agents/live/checklists/Phase1.md` (M1.2 subtasks).

**Dependency:** API is ready. No DB changes required for M1.2.

---

## 3. M1.5 – Sam (and coordination): End-to-end flow

**Goal:** Provider creates WO → system assigns WO to field platform → completion updates WO.

**Current state:**

- **API:** POST/GET/PATCH work-orders exist. **DB:** `work_orders` has no `platform_job_id` / `platform_type` yet.
- **Adapter:** `packages/outbound-adapters` has WorkMarket mock: `push(workOrder)` returns `{ platform_job_id, deep_link, platform_type }`. Mock stores job in memory; `getStatus` / optional `mockSetStatus` for testing.

**Steps for Sam (and Corey if DB/API changes needed):**

1. **Store platform job on WO:** Add `platform_job_id` (TEXT) and `platform_type` (TEXT) to `work_orders` (new migration, e.g. `00002_platform_job.sql`). Update `apps/api/src/db.js` and PATCH/GET to read/write these fields.
2. **Assignment flow:** When a WO is ready to be sent to the field (e.g. status = `scheduling` or `parts_shipped`), something must:
   - Call the WorkMarket adapter’s `push(workOrder)`.
   - Update the WO: set `status = 'assigned'`, `platform_job_id = result.platform_job_id`, `platform_type = result.platform_type`. This can be:
     - An **API endpoint** (e.g. `POST /v1/work-orders/:id/assign` or PATCH with `status: 'assigned'` that triggers push), or
     - A **script** that finds WOs in `scheduling` and calls the adapter then PATCHes the WO.
3. **Completion flow:** When the platform reports “completed” (via mock `mockSetStatus` or a future webhook), update the WO to `status = 'completed'` and optionally store completion payload. This can be a small script or a **webhook endpoint** (e.g. `POST /webhooks/field/workmarket`) that reads platform_job_id, finds the WO, and PATCHes it to completed.

**Deliverables:**

- Migration + API/db support for `platform_job_id` and `platform_type`.
- A way to “assign” a WO to the platform (endpoint or script) and persist platform_job_id.
- A way to move WO to “completed” when the platform says so (script or webhook).
- Update `agents/live/build-notes/Sam.md` and `agents/live/checklists/Phase1.md` (M1.5 subtasks).

**Coordination:** If Sam adds a migration, ensure it’s run (e.g. `node apps/api/scripts/run-migration.js` or a new script for 00002). Corey can own the migration file and db.js changes if preferred; Sam owns the adapter wiring and assignment/completion flow.

---

## 4. Order of work

1. **Dana** can start **M1.2** immediately (no schema change).
2. **Sam** can start **M1.5** by adding the migration and db/api support for platform_job_id, then the assign and completion flow. Dana’s provider mapping will then be able to create WOs that Sam’s flow can assign.
3. **Quinn:** Add tests for POST/GET/PATCH and, when available, for assign/completion. Verify M1.5 flow.

---

*After M1.2 and M1.5 are done, mark them in `agents/live/CHECKLIST.md` and run Phase 1 GitHub sync (Jordan/Archie).*
