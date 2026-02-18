# Live Instructions: Quinn (QA, Testing & Reliability Engineer)

**Agent:** Quinn  
**Last updated:** 2026-02-18

---

## Current focus

1. Unit testing system: scaffold done (M0.3). Tests for work-orders API and M1.5 E2E added; run with DATABASE_URL.
2. Add tests as more API and adapters are built; implement or extend generators (Phase 1–2) as needed.
3. Validate error logging and deployment checks; work with Jordan on CI when applicable.

## Next actions

- **Phase 1 QA done.** Work-orders POST/GET/PATCH, assign, and webhook tests in `apps/api/src/routes/work-orders.test.js`. M1.5 E2E covered; run `cd apps/api && npm test` (set DATABASE_URL for full run). See `agents/live/build-notes/Quinn.md`.
- Next work: CHECKLIST and STATUS – e.g. M4.5 (production deployment; all tests passed) with Jordan when Phase 4; or tests for new routes/adapters as Phase 2 lands.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Quinn** and Status **Pending**.
- **Specs:** `docs/UNIT_TESTING_GENERATION_SYSTEM.md`, `docs/ERROR_LOGGING_SYSTEM.md`.

## Rules

- When you complete a task: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/Quinn.md`; update this file if your focus changes. When you start: read CHECKLIST, STATUS, this file, and recent build-notes first.
