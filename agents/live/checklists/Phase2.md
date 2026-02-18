# Phase 2 – Detailed Checklist

Use this for **subtask-level** progress. Main status stays in `agents/live/CHECKLIST.md`. Spec: `docs/PHASE2_HANDOFF.md`.

---

## M2.1 – Service-type engine + completion validation (Corey) ✅ Done

- [x] Read `docs/PHASE2_HANDOFF.md` (§ M2.1) and service-type design in SCT Enhanced System Design
- [x] Implement or extend service_type_config: required status sequence and/or required fields per service_type
- [x] Completion validation: when WO → completed, validate required fields for that service_type
- [x] No breaking changes to existing POST/GET/PATCH work-orders
- [x] Update build-notes/Corey.md and this checklist; mark CHECKLIST M2.1 Done

---

## M2.2 – Report Center (Riley)

- [ ] Read `docs/PHASE2_HANDOFF.md` (§ M2.2)
- [ ] Portal app in apps/portal (or extend existing); auth placeholder
- [ ] Open WOs list (filter by status, provider, service_type)
- [ ] TAT view (requested→assigned, assigned→completed or equivalent)
- [ ] Tech assign: link/action to assign (POST /v1/work-orders/:id/assign or deep_link)
- [ ] Parts return: WOs with parts/cores return status if available
- [ ] Update build-notes/Riley.md and this checklist; mark CHECKLIST M2.2 Done

---

## M2.5 – Export CSV/Excel (Riley)

- [ ] Read `docs/PHASE2_HANDOFF.md` (§ M2.5)
- [ ] Export: API route or script for CSV (and optionally Excel); fields per handoff
- [ ] Support date range or provider filter for billing/claims use
- [ ] Update build-notes and this checklist; mark CHECKLIST M2.5 Done

---

## M2.3 – EDI or second provider or webhooks (Dana) ✅ Done 2026-02-18

- [x] Read `docs/PHASE2_HANDOFF.md` (§ M2.3)
- [x] Implemented **Option B** (second provider) + **Option C** (inbound webhook): second provider `ext_warranty_new` mapper; POST /webhooks/inbound/:provider_key with mapper registry
- [x] Use packages/inbound-adapters and packages/logger; mapping documented in build-notes
- [x] Update build-notes/Dana.md and this checklist; mark CHECKLIST M2.3 Done

---

## M2.4 – Second adapter or internal assign UI (Sam) ✅ Done 2026-02-18

- [x] Read `docs/PHASE2_HANDOFF.md` (§ M2.4)
- [x] Implemented **Option A:** Wire Field Nation into assign flow (platform_type=workmarket|fieldnation on POST .../assign) + Field Nation completion webhook (POST /webhooks/field/fieldnation); spec in docs/WEBHOOK_FIELD_NATION_SPEC.md
- [x] Document in build-notes; update this checklist; mark CHECKLIST M2.4 Done

---

*Agents: update this file as you complete subtasks; keep CHECKLIST.md in sync.*
