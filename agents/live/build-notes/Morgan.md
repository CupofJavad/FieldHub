# Build notes: Morgan (AI & Automation)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M4.3 (Billing/claims automation, with Corey)

- **DIAG vs repair** (`packages/ai/src/agents/billing-rules.js`): `classifyBillingType(wo)` → `'diag'` or `'repair'` (success + parts_used = repair; NPF/unreachable/no parts = diag). Used by claim-processing.
- **Deductions** (`billing-rules.js`): `applyDeductionRules(wo, { tatThresholdDays })` → list of codes: unreachable, npf, tat_breach, parts_not_returned, panel_defect, duplicate, etc. Feeds proposed_claim and submission payload.
- **Claim-processing extended** (`claim-processing.js`): `prepareClaim(wo, options)` now returns `billing_type`, `deductions`; optional `tatThresholdDays`. `buildClaimSubmissionPayload(wo, { provider_format: 'generic'|'oem'|'ext_warranty' })` → payload for provider API or batch. `ingestProviderResponse(providerResponse, wo)` → `suggested_wo_updates` (metadata: claim_status, claim_denial_reason, claim_deduction_code, claim_amount_paid); human approves before PATCH WO.
- **API:** POST `/v1/ai/agents/claims/prepare` (body may include `tat_threshold_days`); POST `/v1/ai/agents/claims/submission-payload` (body: work_order, provider_format?); POST `/v1/ai/agents/claims/ingest-response` (body: provider_response, work_order?). Claim submission and response ingestion are agent-output only; human or Corey’s layer submits to provider and applies WO updates.
- **Handoff (Corey):** WO metadata can store claim_status, claim_denial_reason, claim_deduction_code (e.g. merge suggested_wo_updates.metadata into WO on PATCH). No new DB table required for M4.3; optional claim_log table later.

---

## 2026-02-18 – M3.5 (AI-led agents integration)

- **Parts reconciliation** (`packages/ai/src/agents/parts-reconciliation.js`): `suggestPartsReconciliation(workOrders, trackingEvents)` – match tracking to WO parts → suggestions (parts_shipped, return_received). `suggestOpenCores(workOrders, { openAfterDays })` – flag open cores for 14–21 day reminders.
- **Claim-processing** (`packages/ai/src/agents/claim-processing.js`): `prepareClaim(wo)` – map completion_payload to proposed_claim (result, parts_used, tat_days); returns ready_for_submit, denial_reasons. `proposeClaimStatusUpdate(providerResponse, wo)` – suggest action after provider approve/deny.
- **Tech comms** (`packages/ai/src/agents/tech-comms.js`): `suggestTechReminders(workOrders, options)` – rules: appointment_reminder (24h), parts_delivered_schedule, cores_return_reminder (14+ days). Returns pending_messages with draft_content; human approves before send.
- **API:** POST `/v1/ai/agents/parts/suggest`, `/v1/ai/agents/claims/prepare`, `/v1/ai/agents/tech-comms/suggest`. All propose/draft only; human in the loop. Invoke and approval flows documented in `packages/ai/src/agents/README.md`.
- **Phase 3 complete.** Handoff: Archie/Jordan – Phase 3 GitHub sync when ready.

---

## 2026-02-18 – M3.4 (Conversational dispatch)

- **Dispatch parse** (`packages/ai/src/dispatch/`): `parseDispatchUtterance(utterance)` – rule-based (regex/keywords), no LLM. Intents: schedule_wo, list_open, assign_wo, unknown. Entities: zip (5-digit), wo_id (UUID/hex), date (tomorrow/next week/YYYY-MM-DD). `suggestedActionsFor(intent, entities)` maps to GET /v1/work-orders, GET /v1/ai/scheduling-suggestions, POST /v1/work-orders/:id/assign. Documented in `packages/ai/src/dispatch/SUPPORTED_PHRASES.md`.
- **API:** `POST /v1/ai/dispatch-parse` body `{ "utterance": "…" }` → `{ intent, entities, suggested_actions }`. Human confirms before executing any suggested_actions; no autonomous execution.
- **Handoff:** Report Center or chat UI can call dispatch-parse → show suggested_actions → user confirms → client calls API. Next: M3.5 (AI-led agents).

---

## 2026-02-18 – M3.3 (Document/notes extraction, LLM)

- **Extraction** (`packages/ai/src/extraction/`): `extractWoFieldsFromText(text, options)` – calls OpenAI Chat Completions (env `OPENAI_API_KEY`); model from `OPENAI_MODEL` or default `gpt-4o-mini`. Prompt asks for JSON: problem, product (brand, model, serial), ship_to (name, address_line1, city, state, zip, phone), instructions, requested_date_start/end. Output sanitized to known keys only. If no key: returns `{ suggested_wo_fields: null, error: "OPENAI_API_KEY not set…" }`.
- **API:** `POST /v1/ai/extract-notes` body `{ "text": "…" }` → `{ suggested_wo_fields, error? }`. 503 if LLM unavailable (no key). **Wire to WO create:** Human (or inbound route) calls extract-notes → reviews suggested_wo_fields → merges with required `external_id`, `provider_key`, `payer_type`, `service_type` → `POST /v1/work-orders`. No autonomous create; human review before create per handoff.
- **Handoff:** Portal/inbound can add “Submit notes” → call POST /v1/ai/extract-notes → show suggested payload for edit → submit as POST /v1/work-orders. Next: M3.4 (conversational dispatch).

---

## 2026-02-18 – M3.2 (Scheduling suggestions; anomaly alerts)

- **Scheduling** (`packages/ai/src/scheduling/`): `getReadyToSchedule(workOrders, options)` – WOs in scheduling/parts_shipped with no appointment; `suggestAppointmentWindows(wo, options)` – next N weekday dates within requested window or from today; `getSchedulingSuggestions(workOrders, singleWo, options)` – combined. Used by Report Center or API.
- **Anomaly** (`packages/ai/src/anomaly/`): `detectAnomalies(workOrders, config)` – (1) TAT breach: completed WO over N days from requested; (2) TAT at risk: open WO past requested date; (3) stuck: in scheduling/assigned for X days; (4) rejection: completion result not success (npf, unreachable, etc.); (5) rejection_spike: provider with ≥30% negative rate (≥3 completed). Config: `tatThresholdDays` (default 7), `stuckThresholdDays` (default 5).
- **API** (`apps/api/src/routes/ai.js`): `GET /v1/ai/scheduling-suggestions?wo_id=…&statuses=…&slots_count=5`; `GET /v1/ai/anomalies?tat_threshold_days=7&stuck_threshold_days=5&status=…&provider_key=…`. Both use existing `listWorkOrders`/`getWorkOrderById`; no new DB.
- **Handoff:** Report Center / portal can call these endpoints; human decides, AI suggests. Next: M3.3 (document extraction).

---
