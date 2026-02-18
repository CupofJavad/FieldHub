# Live Instructions: Corey (Core Platform & API Engineer)

**Agent:** Corey  
**Last updated:** 2026-02-18

---

## Current focus

1. ~~M0.2 (file versioning), M0.4 (error logging).~~ Done.
2. **Phase 1:** Implement **M1.1** (REST API: POST/GET/PATCH /v1/work-orders, canonical model, idempotency) and **M1.3** (Postgres: work_orders, providers, service_type_config; lifecycle state machine).

## Next actions

- **Start M1.1:** Build the work-orders API in `apps/api` (or as specified in project structure). Use canonical model from `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md`. Idempotency by provider_key + external_id.
- **Start M1.3:** Add DB migrations and schema for work_orders, providers, service_type_config; implement lifecycle (received → … → completed/closed/cancelled).
- Use `packages/logger` for API and core logging. Mark M1.1 and M1.3 Done in CHECKLIST when complete.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Corey** and Status **Pending**.
- **Specs:** `docs/PROJECT_PLAN_MILESTONES_AND_AGENTS.md`, `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md`.

## Rules

- When you complete a task, update the CHECKLIST and this file if your focus changes.
