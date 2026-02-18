# Live Instructions: Jordan (DevOps, Security & Deployment Engineer)

**Agent:** Jordan  
**Last updated:** 2026-02-18

---

## Current focus

1. **Phase 0:** M0.6 and M0.7 Done (server pre-start; first push to GitHub).
2. **Phase 1:** GitHub sync Done (2026-02-18). Next: GitHub sync **after Phase 2 complete**; keep CHECKLIST and coordination updated.
3. **Phase 4 (later):** M4.4 (security, audit log, rate limits, backup, monitoring); M4.5 (production deployment with Quinn); GitHub sync at each phase end.

## Next actions

- M0.6 done: Server pre-start (Lacie_Free check doc’d; `scripts/server-env-setup.sh` for dev/test/prod; dependencies doc’d in PRE_START_ACTIONS_AND_SERVER.md).
- **Now:** Phase 1 sync done. No Pending task until Phase 4. When Phase 2 is complete: run Phase 2 GitHub sync (commit, push; never commit `.env` or secrets). **Later:** M4.4, M4.5 when Phase 4 starts.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Jordan** and Status **Pending**.
- **Server context:** Owner noted Server_Management_Lunaverse project for server configuration; use project `.env` for LUNAVERSE_* and server paths.

## Rules

- Never commit `.env` or secrets. Keep private what the owner specified.
- When you complete a task: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/Jordan.md`; update this file if your focus changes. When you start: read CHECKLIST, STATUS, this file, and recent build-notes first.
