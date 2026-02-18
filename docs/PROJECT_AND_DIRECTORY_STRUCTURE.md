# Geeks Next Door (TGND) – Project & Directory Structure

**Purpose:** Single reference for project layout supporting objectives, workflows, versioning, testing, logging, and agent coordination.

---

## 1. Root Layout

```
TGND_System/
├── .env                          # Environment variables (DO NOT COMMIT; in .gitignore)
├── .gitignore
├── README.md                     # Project overview and quick start
├── docs/                         # Design, plan, and structure docs
├── agents/                       # Agent system: prompts, live checklist, instructions
├── tools/                        # Project-specific tooling (versioning, test gen, etc.)
├── apps/                         # Applications (API, workers, portal)
├── packages/                     # Shared packages (canonical model, adapters, AI)
├── db/                           # Migrations and seeds
├── config/                       # Non-secret configuration
├── scripts/                      # One-off and automation scripts
├── logs/                         # Runtime error and app logs (gitignored or rotated)
└── SCT_System_Recreation_Project/  # Legacy design scope docs (preserved)
```

---

## 2. Directory Purposes

| Path | Purpose |
|------|--------|
| `docs/` | Project plan, milestones, agents, directory structure, MCP recommendations, GitHub sync instructions. |
| `agents/` | Agent prompts (initial handoff), live checklist, per-agent instruction files. |
| `tools/` | File versioning scripts/config, unit test generation config, error logging schema or helpers. |
| `apps/api/` | REST (and optional GraphQL) API; inbound work-order endpoints. |
| `apps/workers/` | Queue workers: ingest, outbound sync, AI jobs. |
| `apps/portal/` | Admin + Report Center (e.g. SvelteKit/Next.js). |
| `packages/canonical-model/` | WO, provider, service type types/schemas. |
| `packages/inbound-adapters/` | REST handler, EDI parser, batch CSV. |
| `packages/outbound-adapters/` | WorkMarket, Field Nation, etc. |
| `packages/ai/` | Routing rules, LLM extraction, anomaly. |
| `db/migrations/` | Postgres migrations. |
| `db/seeds/` | Seed data for dev/test. |
| `config/` | Feature flags, provider config templates (no secrets). |
| `scripts/` | Deploy, backup, server checks. |
| `logs/` | Application and error logs (ensure .gitignore). |

---

## 3. Agent-Related Paths

| Path | Purpose |
|------|--------|
| `agents/prompts/` | Initial prompt for each agent (paste into new Cursor chat). |
| `agents/live/CHECKLIST.md` | Live checklist: phases, milestones, tasks, status, assignee. |
| `agents/live/instructions/<AGENT_NAME>.md` | Current focus and next actions for that agent. |

---

## 4. File Versioning (TGND Convention)

See `tools/versioning/README.md` and `docs/FILE_VERSION_TRACKING_SYSTEM.md`.  
Pattern: `{basename}.v{version}.{YYYYMMDD}.{HHmmss}.{ext}` or project-defined variant under `tools/versioning/`.

---

## 5. Alignment with SCT Design

- **Inbound:** API, EDI, webhooks, batch → `apps/api`, `packages/inbound-adapters`, `apps/workers`.
- **Core:** Canonical WO, lifecycle, service types → `packages/canonical-model`, `apps/api`, `db/`.
- **Outbound:** Field platforms → `packages/outbound-adapters`, `apps/workers`.
- **Portal & Report Center:** `apps/portal`.
- **AI:** `packages/ai`, optional AI-led agents (parts, claims, comms) per SCT_AI_and_Human_Operating_Model.md.

---

*Keep this document updated when adding top-level directories or changing responsibilities.*
