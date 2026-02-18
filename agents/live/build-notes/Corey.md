# Build notes: Corey (Core Platform & API)

*(Append new entries at the top. Include date, milestone/task, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M2.1 Service-type engine + completion validation – Done

- **Goal (per `docs/PHASE2_HANDOFF.md` § M2.1):** Service type drives workflow and completion rules; validate required fields when WO → completed.
- **Implemented:** (1) **Migration** `db/migrations/00003_service_type_completion.sql`: added `completion_payload` JSONB on work_orders; added `required_completion_fields` JSONB on service_type_config (default `["completion_payload"]`). (2) **DB:** `getServiceTypeConfig(service_type)`, `getAllServiceTypeConfigs()`; `rowToWorkOrder` and PATCH support `completion_payload`. (3) **Service-type engine** `apps/api/src/service-type-engine.js`: `validateCompletion(wo, config)` checks required_completion_fields (e.g. completion_payload must be non-empty object). (4) **PATCH /v1/work-orders/:id:** when `status: 'completed'`, loads config for WO’s service_type, validates proposed WO (with body.completion_payload); returns 400 `WO_COMPLETION_VALIDATION_FAILED` if missing/invalid. (5) **POST /webhooks/field/workmarket:** same completion validation when platform reports completed; stores `completion_payload` on WO column. (6) **GET /v1/service-types:** returns all service_type_config for Report Center. No breaking changes to existing POST/GET/PATCH.
- **Decision:** Required status sequence is already enforced globally via `@tgnd/canonical-model` TRANSITIONS; per-type sequence left for future use in `service_type_config.required_statuses`. Completion validation is per-type via `required_completion_fields`.
- **Test:** Added `apps/api/scripts/test-m2.1-completion-validation.js`. Unit tests: missing/null/empty completion_payload → invalid; valid payload → valid; no config → valid. **All 6 tests passed.**
- **Handoff (Riley):** Report Center can call GET /v1/service-types; marking WO completed (PATCH or webhook) requires `completion_payload` with at least one of result, parts_used, unit_condition, return_tracking.

---

## 2026-02-18 – M1.5 support (platform_job_id / platform_type)

- **Handoff:** Per `docs/PHASE1_M1.2_M1.5_HANDOFF.md` §3, Corey owns migration + db/API for storing field platform job on WO.
- **Done:** (1) `db/migrations/00002_platform_job.sql` – added `platform_job_id` (TEXT), `platform_type` (TEXT) to work_orders. (2) `apps/api/src/db.js` – rowToWorkOrder returns them; ALLOWED_PATCH_FIELDS includes platform_job_id, platform_type so PATCH can set them. (3) `apps/api/src/routes/work-orders.js` – PATCH body accepts platform_job_id, platform_type. (4) runMigration() now runs all `.sql` files in `db/migrations/` in sorted order (00001, then 00002).
- **Handoff to Sam:** Assign flow can PATCH a WO with `status: 'assigned'`, `platform_job_id`, `platform_type` after adapter.push(wo). No new endpoint required; existing PATCH /v1/work-orders/:id is sufficient. Run migrations: `node apps/api/scripts/run-migration.js` (from repo root; DATABASE_URL in .env).

---

## 2026-02-18 – M1.1 & M1.3 (REST API + Postgres) – Done

- **M1.1:** REST API for work orders (POST/GET/PATCH /v1/work-orders), canonical model, idempotency by provider_key + external_id.
- **M1.3:** Postgres schema (work_orders, providers, service_type_config), lifecycle state machine (received → … → completed/closed/cancelled).
- Stack: Express in apps/api; packages: @tgnd/logger, @tgnd/canonical-model. DB: pg, migrations in db/migrations/.

---
