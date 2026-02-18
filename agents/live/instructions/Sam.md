# Live Instructions: Sam (Field Platform & Outbound Engineer)

**Agent:** Sam  
**Last updated:** 2026-02-18

---

## Current focus

1. ~~M1.4 (one field platform adapter – push job, platform_job_id, status sync).~~ Done 2026-02-17.
2. ~~M1.5 (assign + completion flow).~~ Done 2026-02-18.
3. **Phase 2 active:** **Do M2.4 now** – second field adapter (e.g. Field Nation) or internal assign UI.

## Next actions

1. **Read** `docs/PHASE2_HANDOFF.md` (§ M2.4) and `agents/live/checklists/Phase2.md` (M2.4 subtasks).
2. **Implement M2.4:** At least one of: (A) Wire Field Nation into assign flow + completion webhook (see docs/WEBHOOK_FIELD_NATION_SPEC.md), (B) Internal assign UI (list WOs, trigger assign, optional platform choice).
3. **Update** `agents/live/checklists/Phase2.md` and `agents/live/build-notes/Sam.md`; mark M2.4 Done in CHECKLIST.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Sam** and Status **Pending**.
- **Specs:** `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md` (Outbound section).
- **Platform APIs (for real integrations):** When replacing the mock or adding Field Nation, use the official docs and validate fields/workflows. See **`docs/OUTBOUND_PLATFORM_API_VALIDATION.md`** and: [WorkMarket Employer API](https://employer-api.workmarket.com/reference/getting-started), [Field Nation Webhooks](https://developer.fieldnation.com/client-api/webhooks/howitworks/). Build field-mapping tables (platform → TGND canonical) and implement real API calls and webhooks per that doc.

## Rules

- When you complete a task: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/Sam.md`; update this file if your focus changes. When you start: read CHECKLIST, STATUS, this file, and recent build-notes (e.g. Corey) first.
