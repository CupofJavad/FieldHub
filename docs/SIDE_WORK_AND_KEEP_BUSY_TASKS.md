# Side Work & Keep-Busy Tasks

**Purpose:** Tasks that **do not block** the critical path (Phase 4 milestones) but are useful and can be done **in parallel** or **between** main assignments. Use these to keep agents busy when they are waiting for dependencies or between phases.

**Rule:** Side work must not change behavior required by the main checklist (no breaking changes). Log in build-notes; optionally add a “Side work” section in checklists or this doc to track completion.

---

## By agent (who can do what when idle)

| Agent | Side work (safe to do anytime) |
|-------|--------------------------------|
| **Quinn** | Add tests for existing features (AI routes, export, webhooks); improve test coverage docs; validate error-logging in new routes. |
| **Riley** | Portal polish: loading states, error UX, accessibility, responsive layout; document Report Center user flow; add a “quick start” for local portal. |
| **Dana** | Dev seed data script (sample WOs, providers); document inbound webhook payload examples; optional EDI 850/856 parser scaffold (prep for M4.1). |
| **Sam** | Document assign flow (WorkMarket vs Field Nation); add adapter integration tests (mock); document platform choice logic. |
| **Corey** | API docs (markdown or OpenAPI): list routes, request/response examples; ensure all routes use `packages/logger`; optional: GET /v1/work-orders pagination. |
| **Morgan** | Document dispatch SUPPORTED_PHRASES for operators; document extraction prompt template and wiring; optional: improve anomaly config docs. |
| **Jordan** | Document .env vars (names and purpose, no values) in README or docs; dev setup runbook; audit .gitignore and ensure no secrets in repo. |
| **Archie** | Light: ensure PROJECT_PLAN points to CHECKLIST for live status; optional one-pager “TGND at a glance” for new contributors. |

---

## By category

- **Documentation:** API docs, runbooks, .env docs, user flows, SUPPORTED_PHRASES, extraction prompts. (Corey, Morgan, Riley, Jordan, Archie.)
- **Testing:** Tests for AI routes, export, webhooks; coverage; error-logging checks. (Quinn.)
- **Portal/UX:** Loading states, error messages, a11y, responsive, Report Center quick start. (Riley.)
- **Data & prep:** Seed data, webhook payload examples, EDI scaffold. (Dana.)
- **Integrations:** Assign-flow docs, adapter tests, platform choice docs. (Sam.)
- **Security & ops:** .env documentation, .gitignore audit, dev runbook. (Jordan.)

---

## How to use

- **Assign:** Use the prompts in `agents/prompts/SIDE_WORK_PROMPTS.md` (one prompt per agent per side task). Copy into a new Cursor chat and send.
- **Track:** Agents log side work in `agents/live/build-notes/<Agent>.md`. Optional: add a “Side work” subsection in this doc or in CHECKLIST with checkboxes if you want a single place to track.
- **Priority:** Main checklist (Phase 4) always takes precedence. Side work is “when you have no Pending main task or are waiting on someone else.”
