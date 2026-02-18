# Geeks Next Door (TGND)

**2026 work-order brokering platform** – receive orders from providers (API, EDI, WebHooks), send to field-tech platforms, manage technicians, get paid. The 2026 version of Service Center Team (SCT).

**Owner:** Javad Khoshnevisan  
**Project layout:** See [docs/PROJECT_AND_DIRECTORY_STRUCTURE.md](docs/PROJECT_AND_DIRECTORY_STRUCTURE.md)  
**Plan & agents:** [docs/PROJECT_PLAN_MILESTONES_AND_AGENTS.md](docs/PROJECT_PLAN_MILESTONES_AND_AGENTS.md)

---

## Quick links

| Topic | Doc |
|-------|-----|
| Project plan, phases, milestones, agent roles | [docs/PROJECT_PLAN_MILESTONES_AND_AGENTS.md](docs/PROJECT_PLAN_MILESTONES_AND_AGENTS.md) |
| Directory structure | [docs/PROJECT_AND_DIRECTORY_STRUCTURE.md](docs/PROJECT_AND_DIRECTORY_STRUCTURE.md) |
| File versioning | [docs/FILE_VERSION_TRACKING_SYSTEM.md](docs/FILE_VERSION_TRACKING_SYSTEM.md) |
| Unit testing system | [docs/UNIT_TESTING_GENERATION_SYSTEM.md](docs/UNIT_TESTING_GENERATION_SYSTEM.md) |
| Error logging | [docs/ERROR_LOGGING_SYSTEM.md](docs/ERROR_LOGGING_SYSTEM.md) |
| Agent checklist (live) | [agents/live/CHECKLIST.md](agents/live/CHECKLIST.md) |
| Agent prompts (initial) | [agents/prompts/](agents/prompts/) |
| Pre-start & server | [docs/PRE_START_ACTIONS_AND_SERVER.md](docs/PRE_START_ACTIONS_AND_SERVER.md) |
| GitHub sync | [docs/GITHUB_SYNC_INSTRUCTIONS.md](docs/GITHUB_SYNC_INSTRUCTIONS.md) |
| MCP recommendations | [docs/MCP_RECOMMENDATIONS.md](docs/MCP_RECOMMENDATIONS.md) |

---

## Design scope (SCT recreation)

- [SCT_System_Recreation_Project/](SCT_System_Recreation_Project/) – design scope, enhanced system, end-user workflows, AI vs human operating model.

---

## Agents

Eight agents (Archie, Corey, Dana, Sam, Riley, Morgan, Quinn, Jordan) work from a single **live checklist** and **per-agent instruction files**. Create a new Cursor chat per agent and paste the corresponding initial prompt from `agents/prompts/`. After that, agents use the checklist and instructions without further handoff.

---

## Environment

- Copy `.env.example` to `.env` and fill in values (or use the owner’s existing `.env`). **Do not commit `.env`.**
- Server: Lunaverse (see `.env` and [docs/PRE_START_ACTIONS_AND_SERVER.md](docs/PRE_START_ACTIONS_AND_SERVER.md)). Project can live on Lacie_Free (`/mnt/lacie_external` on server).

---

## Commands (when implemented)

- **Run all tests:** `./tools/testing/tgnd-test-run.sh`
- **Versioned copy of a file:** `./tools/versioning/tgnd_version_copy.sh <path/to/file> [version]`
- **Server check (Lacie_Free):** `./scripts/server-check-lacie.sh` (requires SSH from repo root with .env loaded)
