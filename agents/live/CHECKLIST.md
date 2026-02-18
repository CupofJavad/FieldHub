# TGND Live Checklist – Single Source of Truth for Agent Tasks

**Last updated:** 2026-02-18 (Quinn: M0.3 done)  
**Rules:** Each agent updates their own rows when they complete work. Check this file periodically for new tasks assigned to you. Do not remove or alter other agents’ task rows without coordination.

---

## Phase 0: Foundation

| ID | Task | Owner | Status |
|----|------|--------|--------|
| M0.1 | Project and directory structure created and documented | Archie | ☑ Done 2026-02-17 |
| M0.2 | File version tracking system (naming + tooling) in place | Corey | ☑ Done 2026-02-18 |
| M0.3 | Unit testing generation system scaffold and docs | Quinn | ☑ Done 2026-02-18 |
| M0.4 | Error logging system design and implementation | Corey / Dana | ☑ Done 2026-02-17 |
| M0.5 | Agent system: live checklist, instruction files, initial prompts delivered | Archie | ☑ Done 2026-02-17 |
| M0.6 | Server pre-start: Lacie_Free space check; dev/test/prod envs; dependencies | Jordan | ☑ Done 2026-02-17 |
| M0.7 | Repo init, .gitignore (private files), first push to GitHub | Jordan / Archie | ☐ Pending |

---

## Phase 1: MVP (Inbound + Core WO + One Outbound)

| ID | Task | Owner | Status |
|----|------|--------|--------|
| M1.1 | REST API: POST/GET/PATCH /v1/work-orders, canonical model, idempotency | Corey | ☐ Pending |
| M1.2 | One provider mapping (mock or real OEM/CSV/API) | Dana | ☐ Pending |
| M1.3 | Postgres: work_orders, providers, service_type_config; lifecycle state machine | Corey | ☐ Pending |
| M1.4 | One field platform adapter (e.g. WorkMarket): push job, platform_job_id, status sync | Sam | ☑ Done 2026-02-17 |
| M1.5 | Deliverable: Provider creates WOs; system assigns to one platform; completion updates WO | All | ☐ Pending |

---

## Phase 2: Service Types + Report Center + More Channels

| ID | Task | Owner | Status |
|----|------|--------|--------|
| M2.1 | Service-type engine (OSR, OSS, installation, etc.); completion validation | Corey | ☐ Pending |
| M2.2 | Report Center: open WOs, TAT, tech assign, parts return (WWTS-style) | Riley | ☐ Pending |
| M2.3 | Add EDI (850/856) or second provider; webhooks from providers if needed | Dana | ☐ Pending |
| M2.4 | Second field platform adapter or internal assign UI | Sam | ☐ Pending |
| M2.5 | Export: CSV/Excel for billing and claims | Riley | ☐ Pending |

---

## Phase 3: AI Layer & Automation

| ID | Task | Owner | Status |
|----|------|--------|--------|
| M3.1 | Rule-based routing/assignment (zip, radius, skills); optional “recommend top N” | Morgan | ☑ Done 2026-02-17 |
| M3.2 | Scheduling suggestions; anomaly alerts (TAT, rejection, stuck WOs) | Morgan | ☐ Pending |
| M3.3 | Document/notes extraction (LLM) for WO fields | Morgan | ☐ Pending |
| M3.4 | Optional conversational dispatch (parse “schedule …” → API) | Morgan | ☐ Pending |
| M3.5 | Integration with AI-led agents (parts, claims, outbound comms) per SCT AI model | Morgan / Archie | ☐ Pending |

---

## Phase 4: Scale, Billing & Production

| ID | Task | Owner | Status |
|----|------|--------|--------|
| M4.1 | More providers (OEMs, warranty, customer-pay portal) | Dana | ☐ Pending |
| M4.2 | More field adapters; unified pool view | Sam | ☐ Pending |
| M4.3 | Billing/claims automation (DIAG vs repair, deductions); claim submission | Corey / Morgan | ☐ Pending |
| M4.4 | Security, audit log, rate limits, backup, monitoring | Jordan | ☐ Pending |
| M4.5 | Production deployment; all tests and deployment checks passed | Jordan / Quinn | ☐ Pending |

---

## How to use this checklist

1. **You are an agent:** Open `agents/live/instructions/<YOUR_NAME>.md` for your current focus.
2. **When you complete a task:** Update the Status for your task in this file (e.g. change `☐ Pending` to `☑ Done` and add date).
3. **When you need new work:** Read this CHECKLIST; take the next task assigned to you that is still Pending.
4. **Do not rely on the owner** to assign work; check this file and your instruction file periodically.
