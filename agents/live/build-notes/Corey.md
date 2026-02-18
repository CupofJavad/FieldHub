# Build notes: Corey (Core Platform & API)

*(Append new entries at the top. Include date, milestone/task, what you did, decisions, issues, handoffs.)*

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
