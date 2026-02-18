# Phase 4 – Next Steps & Who Gets What Prompt

**Current state:** Phases 0–3 complete. Phase 4 is the only remaining phase.

---

## Next logical steps (in order)

| Step | Task | Agent | What to do |
|------|------|--------|------------|
| 1 | **M4.1** – More providers (OEMs, warranty, customer-pay) | **Dana** | Add more provider mappings or a customer-pay portal; update build-notes and CHECKLIST. |
| 2 | **M4.2** – More field adapters; unified pool view | **Sam** | Add adapters or a unified pool view for assignment; update build-notes and CHECKLIST. |
| 3 | **M4.3** – Billing/claims (DIAG vs repair, deductions, claim submission) | **Corey** / **Morgan** | Implement billing/claims rules and claim submission; update build-notes and CHECKLIST. |
| 4 | **M4.4** – Security, audit log, rate limits, backup, monitoring | **Jordan** | Add auth, audit log, rate limits, backup, monitoring; update build-notes and CHECKLIST. |
| 5 | **M4.5** – Production deployment | **Jordan** / **Quinn** | Run tests and deployment checks; production deploy; final GitHub sync. |

**Order:** M4.1, M4.2, and M4.3 can run in parallel. M4.4 should be done before or with M4.5. M4.5 last (deploy after the rest).

---

## Who to pass what prompt to

Use **one prompt per agent** from `agents/prompts/PHASE4_AGENT_RUN_PROMPTS.md`:

| Pass this prompt to … | For task |
|-----------------------|----------|
| **Dana** | M4.1 (more providers) – copy Dana block from PHASE4_AGENT_RUN_PROMPTS.md |
| **Sam** | M4.2 (more adapters / unified pool) – copy Sam block |
| **Corey** | M4.3 (billing/claims) – copy Corey block |
| **Morgan** | M4.3 (billing/claims, with Corey) – copy Morgan block |
| **Jordan** | M4.4 (security, audit, backup, monitoring) then M4.5 (deploy) – copy Jordan block |
| **Quinn** | M4.5 (tests + deployment checks, with Jordan) – copy Quinn block |
| **Archie** | Coordination + final GitHub sync after Phase 4 – copy Archie block |

**How to run:** Open a **new Cursor chat** → paste the **full prompt block** for that agent → send. Repeat for each agent when you want them to run.

**Detailed subtasks:** `agents/live/checklists/Phase4.md`  
**Main list:** `agents/live/CHECKLIST.md`
