# TGND Live Status – Coordination for All Agents

**Last updated:** 2026-02-18

---

## Agent session rules (read every time you run)

1. **Start of session:** Read `agents/live/CHECKLIST.md`, `agents/live/STATUS.md`, `agents/live/instructions/<YOUR_NAME>.md`, and recent `agents/live/build-notes/*.md` from agents you depend on. Then set up your environment for your next tasks and take the next Pending task or anticipate work.
2. **When you complete work:** Update (1) `agents/live/CHECKLIST.md` (mark Done + date), (2) `agents/live/checklists/` (detailed subtasks), (3) `agents/live/build-notes/<YOUR_NAME>.md` (what you did, decisions, handoffs). See `agents/live/checklists/README.md` and `agents/live/build-notes/README.md`.
3. **Stay busy:** If no Pending task, set up env for your next milestone, add/refine detailed checklists, read others’ build-notes and anticipate handoffs, run tests/lint. See `docs/AGENT_SYSTEM_AND_AUTONOMY.md` (§4–5).

---

## Current phase

**Phase 0:** Complete (including M0.7 first push).  
**Phase 1:** Complete (M1.1–M1.5 Done). Phase 1 GitHub sync done.  
**Phase 2:** Active. Next: Corey (M2.1), Riley (M2.2, M2.5), Dana (M2.3), Sam (M2.4).

---

## Immediate next actions (by agent)

| Agent | Next action |
|-------|-------------|
| **Jordan** / **Archie** | Phase 1 sync Done. Next: GitHub sync after Phase 2 complete; keep CHECKLIST and coordination updated. |
| **Corey** | **Do M2.1.** Service-type engine (OSR, OSS, installation, etc.); completion validation. Update checklists + build-notes. |
| **Dana** | **Done** (M1.2). Next: M2.3 (EDI/second provider, webhooks). |
| **Sam** | **Done** (M1.4, M1.5). Next: M2.4 (second field adapter or internal assign UI). |
| **Riley** | **Do M2.2, M2.5.** Report Center (open WOs, TAT, tech assign, parts return); export CSV/Excel. Optionally scaffold minimal portal. |
| **Morgan** | M3.1 Done. Next: M3.2 (scheduling, anomaly alerts). |
| **Quinn** | Phase 1 E2E verified. Add tests for Phase 2 as needed. |
| **Archie** | Keep CHECKLIST and STATUS accurate. Phase 2 coordination; trigger GitHub sync after Phase 2 complete. |

---

## Dependency order (Phase 2)

1. **Corey** M2.1 (service-type engine) unblocks completion validation across flows.
2. **Riley** M2.2 (Report Center), M2.5 (export). **Dana** M2.3, **Sam** M2.4 in parallel as needed.
3. **GitHub sync** (Jordan/Archie) after Phase 2 complete.

---

## Where to look for work

- **Tasks:** `agents/live/CHECKLIST.md` (filter by your name; take next Pending).
- **Your focus:** `agents/live/instructions/<YOUR_NAME>.md`.
- **This file:** Read when you need the big picture and next actions.
