# Build notes: Sam (Field Platform & Outbound)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M2.4 Second field platform (Field Nation) + completion webhook

- **Option A implemented:** Wired Field Nation adapter into assign flow and added Field Nation completion webhook.
- **Assign flow:** Extended `POST /v1/work-orders/:id/assign` to accept optional `platform_type`: query `?platform_type=workmarket|fieldnation` or body `{ platform_type }`. Default remains `workmarket`. Uses `createFieldNationAdapter()` when `platform_type=fieldnation`; push(wo) and store platform_job_id/platform_type as before.
- **Field Nation webhook:** Added `POST /webhooks/field/fieldnation`. Body: `platform_job_id` (or `work_order_id`), `status` (FN name, e.g. "Work Done"), optional `completion_payload` / `closing_notes`. Uses `fieldNationStatusToTgnd()` from outbound-adapters to map FN status to TGND; when mapped to `completed`, runs same completion validation (M2.1) and updates WO. Spec: `docs/WEBHOOK_FIELD_NATION_SPEC.md`.
- **Files changed:** `apps/api/src/routes/work-orders.js` (assign platform_type branch, createFieldNationAdapter), `apps/api/src/routes/webhooks.js` (postWebhookFieldNation), `apps/api/src/server.js` (register fieldnation webhook), `docs/WEBHOOK_FIELD_NATION_SPEC.md` (new), `apps/api/README.md` (endpoints), `apps/api/src/routes/work-orders.test.js` (assign platform_type=fieldnation and invalid platform_type; fieldnation webhook 400/200 tests).
- **Decisions:** Kept default platform as workmarket for backward compatibility. FN webhook accepts both `platform_job_id` and `work_order_id` for flexibility with FN payloads.

---

## 2026-02-18 – M1.5 assign + completion flow

- **Read** `docs/PHASE1_M1.2_M1.5_HANDOFF.md` (§3). API and migration 00002 (platform_job_id, platform_type) already in place (Corey).
- **db.js:** Added `getWorkOrderByPlatformJobId(platform_job_id)` for webhook lookup.
- **Assign flow:** `POST /v1/work-orders/:id/assign` – allowed when WO status is `scheduling` or `parts_shipped` and not already assigned. Calls `createWorkMarketAdapter().push(wo)`, then `updateWorkOrder(id, { status: 'assigned', platform_job_id, platform_type })`. Returns updated WO.
- **Completion flow:** `POST /webhooks/field/workmarket` – body `{ platform_job_id, status [, completion_payload ] }`. Finds WO by platform_job_id; if status === 'completed' and transition valid, PATCHes WO to status=completed and optionally merges completion_payload into metadata. Returns 200 { received: true } (ack even if WO not found, to avoid platform retries).
- **apps/api:** Added dependency `@tgnd/outbound-adapters`; registered assign and webhook routes in server.js.
- **Handoff:** Quinn to add tests and verify E2E; then mark M1.5 Done in CHECKLIST.

---
