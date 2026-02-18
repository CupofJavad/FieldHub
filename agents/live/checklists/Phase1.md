# Phase 1 – Detailed Checklist (MVP)

Use this for **subtask-level** progress. Main status stays in `agents/live/CHECKLIST.md`.

---

## M1.1 – REST API work-orders (Corey) ✅ Done

- [x] POST /v1/work-orders (canonical body, idempotency)
- [x] GET /v1/work-orders/:id (and by provider + external_id if applicable)
- [x] PATCH /v1/work-orders/:id (status/fields)
- [x] Canonical WO model and validation

---

## M1.2 – One provider mapping (Dana) ✅ Done 2026-02-18

- [x] Read `docs/PHASE1_M1.2_M1.5_HANDOFF.md` (§1–2)
- [x] Implement: **API route** POST /v1/inbound/oem_mock (provider JSON → map → create) + **batch script** scripts/ingest-work-orders.js (CSV/JSON → POST API)
- [x] Map provider payload → canonical in `packages/inbound-adapters` (mapOemMockToCanonical); use packages/logger
- [x] Update build-notes/Dana.md and this checklist; mark CHECKLIST M1.2 Done

---

## M1.3 – Postgres + lifecycle (Corey) ✅ Done

- [x] work_orders table
- [x] providers, service_type_config tables (or equivalent)
- [x] Lifecycle state machine in code

---

## M1.4 – Field platform adapter (Sam) ✅ Done

- [x] Push job to platform, store platform_job_id
- [x] Status sync (webhook or poll)

---

## M1.5 – End-to-end deliverable (Sam + coordination)

- [x] Read `docs/PHASE1_M1.2_M1.5_HANDOFF.md` (§3)
- [x] Add migration 00002: platform_job_id, platform_type on work_orders; update db.js and API **(Corey 2026-02-18)**
- [x] Implement assign flow: POST /v1/work-orders/:id/assign – adapter.push(wo), then PATCH WO (status=assigned, platform_job_id, platform_type) **(Sam 2026-02-18)**
- [x] Implement completion: POST /webhooks/field/workmarket – body { platform_job_id, status [, completion_payload ] }; find WO, PATCH to status=completed **(Sam 2026-02-18)**
- [x] Update build-notes/Sam.md and this checklist
- [x] Quinn verifies E2E via test suite (apps/api npm test; requires DATABASE_URL) **2026-02-18**

---

*Agents: update this file as you complete subtasks; keep CHECKLIST.md in sync.*
