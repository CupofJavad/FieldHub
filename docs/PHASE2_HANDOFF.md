# Phase 2 – Handoff (Corey, Riley, Dana, Sam)

**Purpose:** Clear deliverables for Phase 2 so each agent can implement, test, log, and update tracking. Phase 1 is complete (API, DB, provider mapping, assign/completion flow).

**Current state:** API has POST/GET/PATCH /v1/work-orders, assign endpoint, WorkMarket webhook. DB has work_orders (with platform_job_id, platform_type), providers, service_type_config. One inbound path (oem_mock + batch script) and one outbound (WorkMarket).

---

## M2.1 – Corey: Service-type engine + completion validation

**Goal:** Service type (OSR, OSS, installation, depot_repair, inspection) drives workflow and completion rules; completion can be validated per type.

**Deliverables:**

- **Service-type engine:** Use or extend `service_type_config` (or equivalent) so each `service_type` can have: required status sequence, required fields for “complete,” optional billing/validation rules. Reference: `packages/canonical-model` SERVICE_TYPES; design in `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md` (§ service types).
- **Completion validation:** When a WO is moved to `completed` (or via webhook), validate that required fields for that service_type are present (e.g. completion_payload, parts_return, etc. as defined in config). Optionally enforce allowed status transitions per service type.
- **API/DB:** Expose or use service_type_config in API if needed; no breaking change to existing POST/GET/PATCH.
- **Log & track:** Update `agents/live/build-notes/Corey.md`, `agents/live/checklists/Phase2.md`; mark M2.1 Done in CHECKLIST.

---

## M2.2 – Riley: Report Center (open WOs, TAT, tech assign, parts return)

**Goal:** Operator-facing Report Center (WWTS-style): view open WOs, TAT metrics, tech assignment, parts return status.

**Deliverables:**

- **Portal app:** Implement or extend the portal in `apps/portal` (or agreed stack). Auth can be placeholder (e.g. simple API key or session) for now.
- **Report Center views:** (1) Open WOs list (filter by status, provider, service_type; call GET /v1/work-orders or equivalent). (2) TAT: e.g. requested → assigned, assigned → completed; show counts or simple metrics. (3) Tech assign: list WOs in scheduling/parts_shipped and link to assign action (call POST /v1/work-orders/:id/assign or show deep_link). (4) Parts return: WOs with parts/cores return status or tracking if stored.
- **Specs:** `SCT_System_Recreation_Project/SCT_End_User_Workflows_And_Processes.md`, Report Center references in Enhanced System Design.
- **Log & track:** Update `agents/live/build-notes/Riley.md`, `agents/live/checklists/Phase2.md`; mark M2.2 Done in CHECKLIST.

---

## M2.5 – Riley: Export CSV/Excel for billing and claims

**Goal:** Export work orders (or filtered sets) to CSV/Excel for billing and claims.

**Deliverables:**

- **Export endpoint or script:** API route (e.g. GET /v1/work-orders/export?format=csv&...) or script that reads WOs from DB/API and outputs CSV (and optionally Excel). Fields: id, external_id, provider_key, status, service_type, ship_to, appointment_date, platform_job_id, completed_at, etc.
- **Use case:** Billing and claims teams can download data for a date range or provider.
- **Log & track:** Update build-notes and Phase2 checklist; mark M2.5 Done in CHECKLIST.

---

## M2.3 – Dana: EDI (850/856) or second provider; webhooks

**Goal:** Add a second inbound channel: EDI (850 PO, 856 ASN) or a second provider mapping; provider webhooks if needed.

**Deliverables:**

- **Option A – EDI:** Parser for 850 (purchase order) and/or 856 (ship notice); map to canonical WO (or WO update); ingest via script or API. Use `packages/inbound-adapters` and `packages/logger`.
- **Option B – Second provider:** Second provider_key (e.g. ext_warranty_new or another OEM); API route or batch script that maps provider-specific payload to canonical and calls POST /v1/work-orders.
- **Option C – Webhooks:** Inbound webhook endpoint for a provider (e.g. POST /webhooks/inbound/:provider_key) that receives payload, maps to canonical, creates/updates WO.
- **At least one** of A/B/C implemented; document in build-notes which and how it maps to canonical.
- **Log & track:** Update `agents/live/build-notes/Dana.md`, `agents/live/checklists/Phase2.md`; mark M2.3 Done in CHECKLIST.

---

## M2.4 – Sam: Second field platform adapter or internal assign UI

**Goal:** Either a second field platform (e.g. Field Nation) wired to assign flow, or an internal assign UI that lists WOs and lets operator choose platform/action.

**Deliverables:**

- **Option A – Second adapter:** Wire Field Nation adapter (in `packages/outbound-adapters`) into assign flow: config or API to choose WorkMarket vs Field Nation per WO or provider; call correct adapter’s push(), store platform_job_id and platform_type. Add Field Nation completion webhook if not already present (see `docs/WEBHOOK_FIELD_NATION_SPEC.md`).
- **Option B – Internal assign UI:** UI that lists WOs ready to assign, lets operator trigger assign (and optionally choose platform); calls existing POST /v1/work-orders/:id/assign (or extended to accept platform_type). Can be part of Riley’s Report Center or a separate minimal page.
- **At least one** of A or B; document in build-notes.
- **Log & track:** Update `agents/live/build-notes/Sam.md`, `agents/live/checklists/Phase2.md`; mark M2.4 Done in CHECKLIST.

---

## Order of work and completion

- **Corey M2.1** can start first (service-type engine unblocks completion validation).
- **Riley M2.2 and M2.5** can run in parallel; M2.2 is the main Report Center; M2.5 can follow or in same session.
- **Dana M2.3** and **Sam M2.4** can run in parallel with each other and with Riley.
- When all M2.1–M2.5 are Done, update CHECKLIST and run **Phase 2 GitHub sync** (Jordan/Archie).

**After each task:** Test your work, log in build-notes, update CHECKLIST and `agents/live/checklists/Phase2.md`, then wait for next assignment from CHECKLIST.
