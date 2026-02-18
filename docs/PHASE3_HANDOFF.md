# Phase 3 – Handoff (Morgan, Archie)

**Purpose:** Clear deliverables for Phase 3 (AI layer & automation) so Morgan (and Archie for M3.5) can implement, test, log, and update tracking. Phase 1 and Phase 2 are complete.

**Current state:** `packages/ai` has M3.1 (rule-based routing, recommend top N). Report Center, export, service-type engine, second provider/adapter are in place. Design: `SCT_System_Recreation_Project/SCT_AI_and_Human_Operating_Model.md`, `SCT_Enhanced_System_Design_And_Build_Scope.md` (AI section).

---

## M3.2 – Morgan: Scheduling suggestions; anomaly alerts

**Goal:** Help operators with scheduling suggestions and surface anomalies (TAT, rejection, stuck WOs).

**Deliverables:**

- **Scheduling suggestions:** Use WO data (requested_date_start/end, appointment_date, ship_to, service_type) and optionally tech availability to suggest next best appointment windows or “ready to schedule” list. Can be API (e.g. GET /v1/ai/scheduling-suggestions?wo_id=…) or a function in `packages/ai` consumed by Report Center or a script. Human decides; AI suggests.
- **Anomaly alerts:** Detect and surface: (1) TAT breaches (e.g. requested → completed over N days), (2) high rejection or decline rate by provider/zip/tech, (3) stuck WOs (e.g. in scheduling/assigned for X days with no movement). Output: list or API (e.g. GET /v1/ai/anomalies) or events fed to logger/dashboard. Use existing WO API and DB; no new DB required unless you add an anomaly_log table.
- **Log & track:** Update `agents/live/build-notes/Morgan.md`, `agents/live/checklists/Phase3.md`; mark M3.2 Done in CHECKLIST.

---

## M3.3 – Morgan: Document/notes extraction (LLM) for WO fields

**Goal:** Extract structured WO fields from free-text notes or documents (e.g. problem, model, serial, address) using an LLM.

**Deliverables:**

- **Extraction pipeline:** In `packages/ai`: function or API that accepts text (notes, email body, upload) and returns structured fields (problem, product, ship_to snippets, serial, etc.) for mapping into canonical WO. Use an external LLM API (OpenAI/Anthropic or env-configured); keep keys in env. Schema of output should align with canonical WO fields (see `packages/canonical-model`, API POST body).
- **Integration point:** Can be called by an inbound route (e.g. “submit notes” → extract → suggest WO payload) or by a script; human reviews before create. Document in build-notes how to invoke and how to wire to WO create flow.
- **Log & track:** Update build-notes and Phase3 checklist; mark M3.3 Done in CHECKLIST.

---

## M3.4 – Morgan: Optional conversational dispatch

**Goal:** Parse natural language (e.g. “schedule the next available for zip 95834”) into intent and entities, then call internal API (e.g. list WOs, trigger assign/scheduling).

**Deliverables:**

- **Intent + entity parsing:** In `packages/ai`: accept a short utterance, return structured intent (e.g. schedule_wo, list_open, assign_wo) and entities (zip, wo_id, date window). Use LLM or rule-based regex/keywords; document supported phrases.
- **API bridge:** Map parsed result to one or more internal API calls (GET /v1/work-orders, POST /v1/work-orders/:id/assign, etc.). Can be a thin endpoint (e.g. POST /v1/ai/dispatch-parse { "utterance": "…" } → { "intent", "entities", "suggested_actions" }) or a script. Human executes or confirms; no autonomous execution of destructive actions without review.
- **Log & track:** Update build-notes and Phase3 checklist; mark M3.4 Done in CHECKLIST.

---

## M3.5 – Morgan / Archie: Integration with AI-led agents (parts, claims, outbound comms)

**Goal:** Integrate with or scaffold the AI-led agents described in `SCT_AI_and_Human_Operating_Model.md`: parts reconciliation, claim-processing, outbound tech-communications. Human in the loop for review and override.

**Deliverables:**

- **Scaffold or integration:** (1) **Parts reconciliation agent:** Match tracking to WOs; suggest “parts shipped” / “return received”; flag open cores and discrepancies. (2) **Claim-processing agent:** Map completion payload to provider claim format; prepare or submit claims; ingest responses and flag denials. (3) **Outbound tech-communications agent:** Rules for reminders (appointment in 24h, parts delivered, cores return); draft or send templated messages (SMS/email/in-app). Each agent can be a module in `packages/ai` or a separate package; expose “suggest” or “propose” APIs that a human or Report Center can approve. No full production deployment required—scaffold + one working path per agent is enough for M3.5.
- **Human in the loop:** All three agents propose or draft; human reviews/approves before master data or external send. Document in build-notes how each agent is invoked and how approval flows work.
- **Archie:** Coordinate with Morgan on scope; ensure CHECKLIST and STATUS reflect M3.5; optionally own integration points or docs.
- **Log & track:** Update `agents/live/build-notes/Morgan.md` (and Archie if applicable), `agents/live/checklists/Phase3.md`; mark M3.5 Done in CHECKLIST.

---

## Order of work and completion

- **M3.2** then **M3.3** then **M3.4** then **M3.5** is a natural sequence; M3.2 and M3.3 can be parallel if desired.
- When all M3.2–M3.5 are Done, update CHECKLIST and run **Phase 3 GitHub sync** (Jordan/Archie).

**After each task:** Test your work, log in build-notes, update CHECKLIST and `agents/live/checklists/Phase3.md`, then wait for next assignment from CHECKLIST.
