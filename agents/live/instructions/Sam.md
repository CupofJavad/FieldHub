# Live Instructions: Sam (Field Platform & Outbound Engineer)

**Agent:** Sam  
**Last updated:** 2026-02-18

---

## Current focus

1. ~~M1.4 (one field platform adapter – push job, platform_job_id, status sync).~~ Done 2026-02-17.
2. ~~M1.5 (assign + completion flow).~~ Done 2026-02-18.
3. Phase 2: M2.4 (second adapter or internal assign UI).

## Next actions

1. **Phase 2:** M2.4 – second field platform adapter or internal assign UI. When starting: read CHECKLIST, STATUS, and handoff docs as needed.
2. After Quinn verifies M1.5 E2E, no further Sam action for M1.5.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Sam** and Status **Pending**.
- **Specs:** `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md` (Outbound section).
- **Platform APIs (for real integrations):** When replacing the mock or adding Field Nation, use the official docs and validate fields/workflows. See **`docs/OUTBOUND_PLATFORM_API_VALIDATION.md`** and: [WorkMarket Employer API](https://employer-api.workmarket.com/reference/getting-started), [Field Nation Webhooks](https://developer.fieldnation.com/client-api/webhooks/howitworks/). Build field-mapping tables (platform → TGND canonical) and implement real API calls and webhooks per that doc.

## Rules

- When you complete a task: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/Sam.md`; update this file if your focus changes. When you start: read CHECKLIST, STATUS, this file, and recent build-notes (e.g. Corey) first.
