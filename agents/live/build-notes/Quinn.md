# Build notes: Quinn (QA, Testing & Reliability)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – Work-orders API tests + M1.5 E2E verification

- **Scope:** Add tests for POST/GET/PATCH /v1/work-orders, assign, and webhook completion per `docs/PHASE1_M1.2_M1.5_HANDOFF.md` §1 and §4.
- **Files added/changed:**
  - `apps/api/src/server.js`: Export `app` and `port`; only call `app.listen()` when `require.main === module` so tests can mount the app without starting the server.
  - `apps/api/package.json`: Added `"test": "node --test src/routes/work-orders.test.js"` and devDependency `supertest@^7.0.0`.
  - `apps/api/src/routes/work-orders.test.js`: New integration test file using `node:test`, `node:assert`, and `supertest`.
- **Tests implemented:**
  - **POST /v1/work-orders:** 400 when external_id/provider_key missing, invalid payer_type/service_type; 201 with id, external_id, status for valid minimal body.
  - **GET /v1/work-orders:** 400 when neither :id nor provider+external_id; 404 for nonexistent id; 200 by id and by provider+external_id after POST.
  - **PATCH /v1/work-orders/:id:** 404 nonexistent; 400 invalid status; 409 invalid lifecycle transition; 200 for valid transition.
  - **POST /v1/work-orders/:id/assign:** 404 nonexistent; 409 when status not assignable; 409 when already assigned; 200 and sets platform_job_id when WO in scheduling.
  - **POST /webhooks/field/workmarket:** 400 when platform_job_id missing; 200 received:true for unknown platform_job_id; updates WO to completed when status=completed.
  - **M1.5 E2E:** Full flow create → scheduling → assign → webhook completed; GET final WO shows status=completed.
- **Run:** From repo root: `./tools/testing/tgnd-test-run.sh`. From API: `cd apps/api && npm test`.
- **DATABASE_URL:** Integration tests require a real Postgres DB. If `DATABASE_URL` is not set, the test file prints a warning and exits 0 so the rest of the suite can run. Set `DATABASE_URL` (e.g. from `.env` at repo root) to execute all API tests and assert against the DB.
- **Coverage/gaps:** No unit-level mocks; all tests are integration. Outbound-adapters package test (push) can hang when run via tgnd-test-run.sh; no change made there (owner: Sam). Logger and ai package tests pass.
- **Tracking:** Phase1.md updated to mark Quinn E2E verification done via test suite. No new CHECKLIST row (M1.5 already Done; Quinn’s remit was add tests + verify).

---
