# SCT Recreation: AI and Human Operating Model

**Purpose:** Define which roles and processes are run by **AI agents** (with human in the loop), which are **human-led with AI support**, and which must remain **human-only** in the recreated system.  
**Audience:** Javad (project owner). Aligns with the goal of using AI for difficult and less desirable work while keeping humans in the loop everywhere else—especially the on-site tech—and reserving certain tasks (e.g. inbound phone calls) for humans only.

**Related docs:** [SCT_Enhanced_System_Design_And_Build_Scope.md](./SCT_Enhanced_System_Design_And_Build_Scope.md), [SCT_End_User_Workflows_And_Processes.md](./SCT_End_User_Workflows_And_Processes.md).

---

## 1. Principles

1. **AI for difficult or less desirable work** – Use agents for parts reconciliation, claim processing, and outbound tech communications (reminders) so humans focus on judgment and relationship.
2. **Human in the loop for everything else** – All other roles stay human-operated; AI can assist but not replace (suggestions, automation of prep, not final decisions without human review where it matters).
3. **On-site tech is always human** – The technician at the customer’s location is human; AI only **supports** (repair/diag instructions, claims help, service radius assignment, etc.).
4. **Some processes must stay human-only** – Inbound phone calls and other high-touch, high-judgment interactions (scheduling with EU, escalations, exceptions) are not handed to AI agents.

---

## 2. Operating Model Summary

| Category | Who/what operates | Human in the loop? | Notes |
|----------|-------------------|--------------------|--------|
| **AI-led (agent does the work)** | Parts reconciliation agent; claim-processing agent; outbound tech-communications agent | Yes: review, override, exception handling | Difficult or less desirable; agent proposes or executes; human reviews or corrects. |
| **Human-led, AI-assisted** | Back-office (dispatch, scheduling, Report Center); on-site tech (repair, completion) | Human leads; AI assists | AI suggests (e.g. assign, radius, instructions); human decides and acts. |
| **Human-only** | Inbound phone calls; live EU scheduling; escalations; exceptions; final judgment on claims | N/A | No AI agent on the line; system can prep or suggest only. |

---

## 3. AI-Led Processes (Agents + Human in the Loop)

These are the **difficult or less desirable** roles where **AI agents** do the work, with **humans in the loop** to review, override, or handle exceptions.

### 3.1 Parts Reconciliation Agent

**What the agent does:**

- Match inbound tracking (carrier, provider, batch files) to work orders and parts records; suggest or apply “parts shipped” / “return received.”
- Reconcile open cores: match return tracking and waybill data to WO and SCT# tail (-1, -2); flag discrepancies (missing return, wrong WO, duplicate).
- Generate open-cores and “parts not returned” lists; trigger 14–21 day reminders (content can be drafted by AI; see §3.3 for who sends).
- Propose corrections to part numbers, quantities, or vendor tail when data is inconsistent.

**Human in the loop:**

- Review and approve reconciliation results before they update master data (or approve in bulk with exceptions called out).
- Resolve mismatches the agent can’t resolve (e.g. wrong WO, lost core, vendor dispute).
- Override agent suggestions when business context requires it.

**Out of scope for agent:** Placing orders with vendors (e.g. Service Bench, ShopJimmy); that stays human or human-approved. Agent focuses on **reconciliation and tracking**, not procurement decisions.

---

### 3.2 Claim-Processing Agent

**What the agent does:**

- Prepare claims for submission to providers (OEM, extended warranty): map completion payload (result, parts used, TAT) to provider’s claim format; apply DIAG vs repair rules and time limits.
- Submit claims via provider API or generate batch/EDI where supported.
- Ingest provider responses (approved, denied, partial); map to WO and update claim status; flag denials and deduction reasons (unreachable, NPF, panel defect, duplicate, etc.).
- Propose “closed request” and reason codes (defective/repair, STR) for phase act com; draft dispute text or evidence requests (e.g. video proof for same-issue second visit).
- Run deduction logic (parts not shipped, carrier, schedule date) and feed open-WO KPI; surface anomalies (e.g. high denial rate by provider or zip).

**Human in the loop:**

- Review claim batches or high-value claims before submit (if desired); approve or correct.
- Handle disputed or complex denials: decide whether to escalate, re-submit with evidence, or accept.
- Set or override billing/claim rules when provider terms change or exceptions apply.
- Final sign-off on “reject payment to WWTS” or similar when close-out was wrong (agent proposes; human confirms).

**Out of scope for agent:** Live negotiation with provider (phone/email) and one-off exceptions; those are human-only.

---

### 3.3 Outbound Tech-Communications Agent

**What the agent does:**

- **Remind technicians to service customers:** Trigger outbound messages (SMS, email, or in-app) based on rules: e.g. appointment in 24 hours, parts delivered and “need to schedule,” or overdue for completion. Content can be templated or AI-drafted (friendly, clear, with WO# and link).
- **Remind techs of parts return:** Use open-cores and 14–21 day rules to send “please return cores for WO X” messages; include return tracking instructions if needed.
- **Recurring or status-based nudges:** e.g. “You have 3 accepted jobs this week; confirm appointment dates” or “Job Y is still open—update status or contact dispatch.”
- **Do not** engage in two-way conversation on behalf of the company; outbound only. If tech replies, route to human or to a separate “conversational” flow where human is in the loop.

**Human in the loop:**

- Define and tune rules (when to send, channels, tone); approve or edit templates and AI-drafted copy.
- Handle replies and escalations (tech says “can’t make it” or “need parts”); human does reschedule or dispatch actions.
- Turn off or throttle the agent for specific techs or regions if requested (e.g. vacation, preference).

**Out of scope for agent:** Inbound phone calls from techs or customers; those are human-only (§4).

---

## 4. Human-Only Processes (No AI Agent on the Line)

These **must** stay human-operated. The system can **prepare** information or **suggest** next steps, but no AI agent replaces the human in the interaction.

### 4.1 Inbound Phone Calls

- **All inbound voice calls** (from end customers, technicians, or providers) are answered and handled by **humans**.
- Use case: EU calls to schedule, reschedule, complain, or ask status; tech calls for support or to report an issue; provider calls about a WO or claim.
- **System/AI may:** Pop caller context (WO, history) for the agent; suggest scripts or next steps; draft follow-up email/SMS for the human to send. The **human** talks and decides.

**Rationale:** Judgment, empathy, de-escalation, and relationship require a human. AI can support from the sidelines only.

---

### 4.2 Live Scheduling with End Customer (EU)

- When an **EU** must be contacted to confirm or set an appointment, the **human** (back-office or designated scheduler) performs the call or equivalent live contact (e.g. live chat if offered).
- IVR can collect simple choices (e.g. “press 1 for morning”), but **negotiating a specific date/time or handling “I’m not sure”** is human-led.
- **AI may:** Suggest optimal time windows or “next available” slots; prep the WO so the human can set the appointment in one click after the call.

---

### 4.3 Escalations and Exceptions

- **Escalations** (e.g. complaint, demand for manager, provider dispute, 2TR/second repair decision) are handled by **humans**.
- **One-off exceptions** (e.g. “bill this as repair even though it was NPF because of provider agreement”) are decided by **humans**; the claim agent can flag and suggest, not auto-apply.
- **AI may:** Route to the right queue; suggest resolution from past cases; draft text. Human decides and responds.

---

### 4.4 Final Judgment on High-Risk or High-Value Outcomes

- Where provider contracts or money are at stake and the rule is ambiguous, **human** makes the final call (e.g. accept denial vs dispute; waive no-show fee; approve exception pricing).
- **AI may:** Summarize facts, suggest option A vs B, draft text. Human approves or overrides.

---

## 5. Human-Led with AI Support (Including On-Site Tech)

Humans perform the role; **AI assists** with information, suggestions, or automation of prep—not with replacing the human.

### 5.1 Back-Office: Dispatch, Scheduling, Report Center

- **Dispatch:** Human chooses which jobs to assign and to which platform/pool; **AI suggests** techs or ranking (by distance, skills, capacity, history). Human can accept or override.
- **Scheduling:** Human sets confirmed appointment after talking to EU (or after IVR); **AI suggests** windows or clusters to reduce travel. Human confirms.
- **Report Center:** Human runs reports and takes action (assign, follow up, close); **AI** can pre-filter (e.g. “likely stuck”), suggest priorities, or highlight anomalies (TAT, deductions). Human drives.

---

### 5.2 On-Site Technician (Human Only; AI Supports)

The **on-site tech is always a human**. They perform the repair, installation, or delivery and document the result. **AI does not replace the tech.**

**AI support for the tech (assist only):**

- **Repair / service / diag instructions:** On demand, the tech gets step-by-step or model-specific guidance (e.g. from a knowledge base or LLM): how to test, what to replace, wiring/SOP for a given model. Tech follows or adapts; AI does not make the repair.
- **Claims processing assistance:** When the tech is completing the job, AI can suggest the right result code and required fields (parts used, return tracking) so the submission is complete and claim-ready. Tech confirms and submits. For post-completion claim questions, AI can surface “what to send to provider” so the tech or back-office can act.
- **Service radius assignment:** AI can suggest or display the tech’s service radius, preferred zips, or “jobs in your area” so the tech (or dispatch) knows where they can be assigned. Human (or dispatch) still assigns; AI informs.
- **Parts and tracking:** AI can show “parts for this WO” and return-tracking instructions; tech performs the return and enters tracking. No autonomous agent acting as the tech.

**What the tech does (human-only):** Accept job, go on site, diagnose, repair/install/deliver, document result and parts, submit completion, return cores. All of that is the **human tech**; AI is a support tool only.

---

### 5.3 Provider and End-Customer Portals (Human-Led)

- **Provider staff** and **end customers** use portals to submit or track; **humans** use the UI. AI can power search, status text, or suggested next steps behind the scenes; no AI “agent” is the face of the company in the portal.

---

## 6. Process-to-Model Quick Reference

| Process | Owner | AI role | Human in the loop / Human-only |
|---------|--------|---------|----------------------------------|
| Parts reconciliation (tracking, cores, reminders) | **AI agent** | Reconcile; match; propose reminders | Human reviews/approves; resolves exceptions |
| Claim preparation and submission; ingestion of denials | **AI agent** | Prepare/submit; map responses; propose close reasons | Human reviews disputes and overrides |
| Outbound tech reminders (service customer, return cores) | **AI agent** | Send templated or AI-drafted messages | Human defines rules; handles replies |
| Inbound phone calls | **Human only** | — | No AI on the line; system can prep context |
| Live EU scheduling (negotiate date/time) | **Human only** | — | AI can suggest windows only |
| Escalations and exceptions | **Human only** | — | AI can suggest or draft only |
| Dispatch (assign techs) | **Human** | AI suggests ranking / radius | Human assigns |
| Scheduling (set appointment after EU contact) | **Human** | AI suggests slots | Human sets |
| Report Center and follow-up | **Human** | AI highlights anomalies and priorities | Human acts |
| On-site repair / install / delivery | **Human tech** | AI: repair/diag instructions; claims help; radius info | Tech is always human; AI assists only |

---

## 7. Implementation Notes

- **Agents:** Implement parts-reconciliation, claim-processing, and outbound-communications as separate agent flows (or one orchestration layer that calls specialized modules). Each should log actions and support “human review” queues or dashboards.
- **Human-in-the-loop UX:** For AI-led processes, provide a clear “review and approve” or “override” path in the Report Center or admin UI so operators can correct and learn from agent mistakes.
- **On-site tech:** Expose AI support (instructions, claim hints, radius) inside the existing field platform (e.g. deep link or embedded panel) or in a lightweight “tech support” app that does not replace the platform.
- **Inbound calls:** Keep all voice handling human; use CTI or CRM integration to surface WO and history so the human has context. Do not use an AI voice agent for inbound customer or tech calls in this model.

---

*This operating model defines the intended split of AI vs human for the SCT recreation project. Adjust per risk and compliance (e.g. regulated claims or communications) and iterate as you build.*
