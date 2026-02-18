# Live Instructions: Riley (Portal & Report Center Engineer)

**Agent:** Riley  
**Last updated:** 2026-02-18

---

## Current focus

1. **Phase 2 active:** **Do M2.2 and M2.5 now.** Report Center (open WOs, TAT, tech assign, parts return) and Export (CSV/Excel for billing/claims). API is live (M1.1).

## Next actions

1. **Read** `docs/PHASE2_HANDOFF.md` (§ M2.2, § M2.5) and `agents/live/checklists/Phase2.md` (M2.2, M2.5 subtasks).
2. **Implement M2.2:** Portal in `apps/portal` (or extend); Report Center: open WOs list, TAT view, tech assign action, parts return. Auth placeholder OK. Use GET /v1/work-orders, POST /v1/work-orders/:id/assign.
3. **Implement M2.5:** Export route or script (CSV/Excel); date range or provider filter for billing/claims.
4. **Update** `agents/live/checklists/Phase2.md` and `agents/live/build-notes/Riley.md`; mark M2.2 and M2.5 Done in CHECKLIST.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Riley** and Status **Pending**.
- **Specs:** `SCT_System_Recreation_Project/SCT_End_User_Workflows_And_Processes.md`, Enhanced System Design.

## Rules

- When you complete a task: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/Riley.md`; update this file if your focus changes. When you start: read CHECKLIST, STATUS, this file, and recent build-notes first.
