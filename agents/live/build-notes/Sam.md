# Build notes: Sam (Field Platform & Outbound)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M1.5 assign + completion flow

- **Read** `docs/PHASE1_M1.2_M1.5_HANDOFF.md` (§3). API and migration 00002 (platform_job_id, platform_type) already in place (Corey).
- **db.js:** Added `getWorkOrderByPlatformJobId(platform_job_id)` for webhook lookup.
- **Assign flow:** `POST /v1/work-orders/:id/assign` – allowed when WO status is `scheduling` or `parts_shipped` and not already assigned. Calls `createWorkMarketAdapter().push(wo)`, then `updateWorkOrder(id, { status: 'assigned', platform_job_id, platform_type })`. Returns updated WO.
- **Completion flow:** `POST /webhooks/field/workmarket` – body `{ platform_job_id, status [, completion_payload ] }`. Finds WO by platform_job_id; if status === 'completed' and transition valid, PATCHes WO to status=completed and optionally merges completion_payload into metadata. Returns 200 { received: true } (ack even if WO not found, to avoid platform retries).
- **apps/api:** Added dependency `@tgnd/outbound-adapters`; registered assign and webhook routes in server.js.
- **Handoff:** Quinn to add tests and verify E2E; then mark M1.5 Done in CHECKLIST.

---
