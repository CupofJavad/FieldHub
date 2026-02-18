# TGND MCP Recommendations

**Purpose:** Which MCPs to install or use for the Geeks Next Door project, based on project needs (API, EDI, portal, AI, deployment, browser testing).

---

## Recommended for TGND

| MCP | Use in TGND |
|-----|--------------|
| **Context7** | Up-to-date docs and examples for libraries (e.g. FastAPI, SvelteKit, Postgres, WorkMarket API). |
| **GitHub** | Repo sync, PRs, branch management; agents push at milestones per plan. |
| **Sequential Thinking** | Complex planning (routing rules, EDI mapping, multi-step workflows). |
| **cursor-ide-browser** | Portal and Report Center UI testing; customer-facing tracking page. |
| **Firebase** | Optional: auth, hosting, or serverless for portal/API if the stack is aligned. |
| **Supabase** | Optional: if using Supabase for Postgres or auth instead of self-hosted. |
| **Docker** | Local and server containers (Postgres, Redis, API, workers); consistent envs. |

---

## Optional / As Needed

| MCP | Use |
|-----|-----|
| **Shadcn Registry** | UI components for the admin portal if using React/Next. |
| **Google (Maps, BigQuery, etc.)** | Maps for tech radius/routing; BigQuery only if analytics are moved there. |
| **Notion** | If the owner wants project or runbooks in Notion. |
| **Browserbase** | Headless browser testing in the cloud if needed beyond cursor-ide-browser. |
| **Figma** | If design handoff or UI specs live in Figma. |

---

## Likely Not Required for Core TGND

- **BrightData, Reddit, GibsonAI** – not implied by current scope (brokering, API, portal, AI routing).
- **Docker Hub MCP** – useful only if publishing images; Docker CLI is enough for run.
- **PgAdmin MCP** – if it exists, optional for DB admin; PGAdmin URL is in `.env` for manual use.

---

## Research Note

The owner asked to research MCPs that could benefit the project (e.g. Ubuntu server or PgAdmin). As of this doc:

- **Ubuntu server:** No dedicated “Ubuntu server MCP” is assumed; SSH and scripts (e.g. `scripts/` and Jordan’s pre-start) cover server tasks.
- **PgAdmin:** Use the existing `PGADMIN_URL` from `.env` for browser access; a PgAdmin MCP would be optional for automation.

---

*Install and enable only the MCPs that match the chosen stack and workflow; add or remove as the project evolves.*
