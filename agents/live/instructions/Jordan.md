# Live Instructions: Jordan (DevOps, Security & Deployment Engineer)

**Agent:** Jordan  
**Last updated:** 2026-02-17

---

## Current focus

1. Server pre-start: Lacie_Free space check; create dev/test/prod envs; check dependencies; do not affect other projects. Update M0.6.
2. Repo init, `.gitignore` (private files), first push to GitHub after Phase 0. Coordinate with Archie. Update M0.7.
3. Later: Docker/CI, security, backups, monitoring (Phase 4); execute GitHub sync at each phase end.

## Next actions

- M0.6 done: Server pre-start (Lacie_Free check doc’d; `scripts/server-env-setup.sh` for dev/test/prod; dependencies doc’d in PRE_START_ACTIONS_AND_SERVER.md).
- **M0.7 now:** Repo is already initialized with initial commit; `.gitignore` in place. Open **`docs/M0.7_FIRST_PUSH_INSTRUCTIONS.md`**, add remote, then `git push -u origin main`. Mark M0.7 Done in CHECKLIST when push succeeds.

## Where to find new work

- **Primary:** `agents/live/CHECKLIST.md` – any task with Owner **Jordan** and Status **Pending**.
- **Server context:** Owner noted Server_Management_Lunaverse project for server configuration; use project `.env` for LUNAVERSE_* and server paths.

## Rules

- Never commit `.env` or secrets. Keep private what the owner specified.
- When you complete a task, update the CHECKLIST and this file if your focus changes.
