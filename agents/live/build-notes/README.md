# TGND Live – Build Notes / Logs

**Purpose:** **Detailed build notes and logs** for what each agent did: decisions, commands run, issues hit, and outcomes. More granular than the main checklist.

## Conventions

- **One file per agent:** `Archie.md`, `Corey.md`, `Dana.md`, `Sam.md`, `Riley.md`, `Morgan.md`, `Quinn.md`, `Jordan.md`.
- **Append-only:** Add new entries at the **top** (most recent first). Use a clear date/time and milestone/task heading.
- **What to log:**
  - What you did (steps, files changed, commands).
  - Decisions (e.g. “Chose FastAPI over Express because…”).
  - Blockers or issues and how you resolved them.
  - Links to PRs, commits, or key files.
  - Next steps or handoff notes for other agents.

## Example entry (at top of your file)

```markdown
## 2026-02-18 – M1.1 & M1.3 (REST API + Postgres)

- Implemented POST/GET/PATCH /v1/work-orders in apps/api (FastAPI).
- Added db/migrations/001_work_orders.sql; work_orders, providers, service_type_config tables.
- Idempotency: provider_key + external_id. Lifecycle: received → … → completed/closed/cancelled.
- Issue: X. Resolved by Y.
- Next: Dana can plug provider mapping into POST /v1/work-orders; Sam can wire adapter to assignment flow.
```

Agents: **when you complete work**, add an entry to your `build-notes/<YourName>.md` and update the main CHECKLIST and any detailed checklist in `checklists/`.
