# Geeks Next Door (TGND) – Project Plan, Milestones & Agents

**Version:** 1.0.0  
**Date:** 2026-02-17  
**Owner:** Javad Khoshnevisan  
**Project:** TGND – 2026 recreation of Service Center Team (SCT) work-order brokering platform.

---

## 1. Vision & Objectives

- **Product:** Web app for brokering work orders via API, EDI, WebHooks, and other data channels; simple onsite technician tool + brokering platform (receive from providers → send to tech platforms → manage techs → get paid).
- **Delivery model:** Designed, built, tested, deployed, and operated by AI agents with minimal owner handoff; agents work cohesively and autonomously via a shared live checklist and instruction system.

---

## 2. Agent Team (Max 8)

| # | Agent Name | Title | Primary Role(s) | Secondary / Shared |
|---|------------|--------|-----------------|---------------------|
| 1 | **Archie** | Project Director & Integration Lead | Overall plan, milestones, integration, GitHub sync | Unblocks agents; coordinates live checklist |
| 2 | **Corey** | Core Platform & API Engineer | Inbound API, canonical WO model, DB, lifecycle | File versioning; unit test harness |
| 3 | **Dana** | Data & Integrations Engineer | EDI, batch (SFTP/S3), webhooks, provider mapping | Error logging integration |
| 4 | **Sam** | Field Platform & Outbound Engineer | WorkMarket/Field Nation adapters, outbound sync, status callbacks | API contracts for field platforms |
| 5 | **Riley** | Portal & Report Center Engineer | Admin portal, Report Center (TAT, assign, parts return), auth | UI testing; error UX |
| 6 | **Morgan** | AI & Automation Engineer | Routing/scheduling rules, anomaly detection, document extraction, conversational dispatch | AI-led agents (parts, claims, comms) integration |
| 7 | **Quinn** | QA, Testing & Reliability Engineer | Unit test generation system, E2E, reliability, performance | Error logging validation; deployment checks |
| 8 | **Jordan** | DevOps, Security & Deployment Engineer | Server envs (dev/test/prod), Docker, CI, security, backups | Lacie_Free layout; GitHub sync execution |

**Live checklist location:** `TGND_System/agents/live/CHECKLIST.md`  
**Per-agent instruction files:** `TGND_System/agents/live/instructions/<AGENT_NAME>.md`

---

## 3. Phases & Milestones

### Phase 0: Foundation (Pre-Start & Setup)

| Milestone | Description | Task Owner | Status |
|-----------|-------------|------------|--------|
| M0.1 | Project and directory structure created and documented | Archie | ☐ |
| M0.2 | File version tracking system (naming + tooling) in place | Corey | ☐ |
| M0.3 | Unit testing generation system scaffold and docs | Quinn | ☐ |
| M0.4 | Error logging system design and implementation | Corey / Dana | ☐ |
| M0.5 | Agent system: live checklist, instruction files, initial prompts delivered | Archie | ☐ |
| M0.6 | Server pre-start: Lacie_Free space check; dev/test/prod envs; dependencies | Jordan | ☐ |
| M0.7 | Repo init, .gitignore (private files), first push to GitHub | Jordan / Archie | ☐ |

---

### Phase 1: Inbound + Core WO + One Outbound (MVP)

| Milestone | Description | Task Owner | Status |
|-----------|-------------|------------|--------|
| M1.1 | REST API: POST/GET/PATCH /v1/work-orders, canonical model, idempotency | Corey | ☐ |
| M1.2 | One provider mapping (mock or real OEM/CSV/API) | Dana | ☐ |
| M1.3 | Postgres: work_orders, providers, service_type_config; lifecycle state machine | Corey | ☐ |
| M1.4 | One field platform adapter (e.g. WorkMarket): push job, platform_job_id, status sync | Sam | ☐ |
| M1.5 | Deliverable: Provider creates WOs; system assigns to one platform; completion updates WO | All | ☐ |

**Phase 1 completion trigger:** GitHub sync (push after M1.5).

---

### Phase 2: Service Types + Report Center + More Channels

| Milestone | Description | Task Owner | Status |
|-----------|-------------|------------|--------|
| M2.1 | Service-type engine (OSR, OSS, installation, etc.); completion validation | Corey | ☐ |
| M2.2 | Report Center: open WOs, TAT, tech assign, parts return (WWTS-style) | Riley | ☐ |
| M2.3 | Add EDI (850/856) or second provider; webhooks from providers if needed | Dana | ☐ |
| M2.4 | Second field platform adapter or internal assign UI | Sam | ☐ |
| M2.5 | Export: CSV/Excel for billing and claims | Riley | ☐ |

**Phase 2 completion trigger:** GitHub sync.

---

### Phase 3: AI Layer & Automation

| Milestone | Description | Task Owner | Status |
|-----------|-------------|------------|--------|
| M3.1 | Rule-based routing/assignment (zip, radius, skills); optional “recommend top N” | Morgan | ☐ |
| M3.2 | Scheduling suggestions; anomaly alerts (TAT, rejection, stuck WOs) | Morgan | ☐ |
| M3.3 | Document/notes extraction (LLM) for WO fields | Morgan | ☐ |
| M3.4 | Optional conversational dispatch (parse “schedule …” → API) | Morgan | ☐ |
| M3.5 | Integration with AI-led agents (parts reconciliation, claims, outbound comms) per SCT AI model | Morgan / Archie | ☐ |

**Phase 3 completion trigger:** GitHub sync.

---

### Phase 4: Scale, Billing & Production

| Milestone | Description | Task Owner | Status |
|-----------|-------------|------------|--------|
| M4.1 | More providers (OEMs, warranty, customer-pay portal) | Dana | ☐ |
| M4.2 | More field adapters; unified pool view | Sam | ☐ |
| M4.3 | Billing/claims automation (DIAG vs repair, deductions); claim submission | Corey / Morgan | ☐ |
| M4.4 | Security, audit log, rate limits, backup, monitoring | Jordan | ☐ |
| M4.5 | Production deployment; all tests and deployment checks passed | Jordan / Quinn | ☐ |

**Phase 4 completion trigger:** Final GitHub sync; project complete.

---

## 4. Task Breakdown (High Level)

- **Archie:** Owns CHECKLIST.md and agent coordination; ensures no overlap; runs/triggers GitHub sync at milestones; unblocks agents.
- **Corey:** API, DB, canonical model, lifecycle, file versioning integration, error logging in core.
- **Dana:** EDI, batch, webhooks, provider mapping, error logging in pipelines.
- **Sam:** Field adapters, outbound sync, webhook ingestion from platforms.
- **Riley:** Portal, Report Center, auth, exports.
- **Morgan:** AI routing/scheduling, anomaly, extraction, conversational; integration with parts/claims/comms agents.
- **Quinn:** Unit test generation system, E2E, reliability, validation of logging and deployment.
- **Jordan:** Server envs, Docker, CI, security, Lacie_Free, GitHub push execution.

---

## 5. Live Checklist & Agent Autonomy

- **Single source of truth:** `agents/live/CHECKLIST.md` – phases, milestones, tasks, subtasks, assignee, status.
- **Per-agent instructions:** `agents/live/instructions/<AGENT_NAME>.md` – each agent’s current focus, next actions, and “check CHECKLIST for new work.”
- **Autonomy rule:** After initial prompt handoff, each agent (1) completes initial tasks, (2) updates CHECKLIST for their items, (3) periodically reads CHECKLIST and their instruction file for new work, (4) does not rely on the owner to copy-paste prompts.
- **Enhancements:** Any change to this system (e.g. adding a queue or priority flags) must be documented and permission requested from Javad before modifying.

---

## 6. GitHub Sync Rules

- **Private:** `.env`, secrets, credentials, and any path listed in `.gitignore` never committed.
- **First push:** After Phase 0 (initial setup) is complete.
- **Subsequent pushes:** After each major milestone (end of Phase 1, 2, 3, 4).
- **Final push:** When project is complete and all milestones, testing, and deployment are done.
- **Executor:** Jordan (or Archie if Jordan unavailable) runs push/sync; agents have permission to run git commands per owner grant.

---

*This document is the master project plan. For design scope see SCT_System_Recreation_Project/*.md. For agent prompts see agents/prompts/ and agents/live/instructions/.*
