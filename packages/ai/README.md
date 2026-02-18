# @tgnd/ai

TGND AI layer: rule-based routing (zip, radius, skills), scheduling suggestions, anomaly alerts, document extraction.

## M3.1 – Rule-based routing / recommend top N

- **Zip:** Filter techs by same zip or allow any (config: `sameZipOnly`).
- **Radius:** Filter by distance in miles when `ship_to` and tech have `latitude`/`longitude` (Haversine); config: `maxRadiusMiles`.
- **Skills:** WO can specify `required_skills`; config can add `serviceTypeSkills[service_type]`. Tech must have all required skills when `requireAllSkills` is true.
- **Recommend top N:** `recommendTopN(workOrder, candidates, { topN: 5, ...config })` returns scored, sorted list (closer + same zip + skills match = higher score).

### Usage

```js
const { recommendTopN } = require('@tgnd/ai');

const workOrder = {
  id: 'wo-1',
  ship_to: { zip: '95834' },
  service_type: 'osr',
  required_skills: ['tv_repair'],
};
const candidates = [
  { id: 't1', zip: '95834', skills: ['tv_repair'] },
  { id: 't2', zip: '95814', skills: ['tv_repair'] },
];

const top = recommendTopN(workOrder, candidates, { topN: 2 });
// => [{ candidate: t1, score: 1150, skillsMatch: true }, ...]
```

Optional for radius: set `ship_to.latitude`, `ship_to.longitude` and tech `latitude`/`longitude`; use `maxRadiusMiles` in config.

## M3.2 – Scheduling suggestions; anomaly alerts

- **Scheduling:** `getReadyToSchedule(workOrders, { statuses })` – WOs in `scheduling`/`parts_shipped` with no `appointment_date`. `suggestAppointmentWindows(wo, { slotsCount })` – next N weekday dates within requested window. `getSchedulingSuggestions(workOrders, singleWo?, options)` – combined. API: `GET /v1/ai/scheduling-suggestions?wo_id=…&slots_count=5`.
- **Anomaly:** `detectAnomalies(workOrders, { tatThresholdDays, stuckThresholdDays })` – returns list of `tat_breach`, `tat_at_risk`, `stuck`, `rejection`, `rejection_spike`. API: `GET /v1/ai/anomalies?tat_threshold_days=7&stuck_threshold_days=5`.

## M3.3 – Document/notes extraction (LLM)

- **Extraction:** `extractWoFieldsFromText(text, options)` – calls OpenAI (env `OPENAI_API_KEY`); returns `{ suggested_wo_fields, error? }`. Fields: problem, product (brand, model, serial), ship_to (name, address_line1, city, state, zip, phone), instructions, requested_date_start/end. Schema aligns with canonical WO; human reviews before create.
- **API:** `POST /v1/ai/extract-notes` body `{ "text": "…" }` → `{ suggested_wo_fields, error? }`. Wire to WO create: human merges suggested_wo_fields with required external_id, provider_key, payer_type, service_type and POSTs to `POST /v1/work-orders`.

## M3.4 – Conversational dispatch

- **Parse:** `parseDispatchUtterance(utterance)` → `{ intent, entities, suggested_actions }`. Rule-based (no LLM). Intents: `schedule_wo`, `list_open`, `assign_wo`, `unknown`. Entities: zip, wo_id, date. Suggested actions are GET/POST descriptions; human confirms before execution.
- **API:** `POST /v1/ai/dispatch-parse` body `{ "utterance": "…" }` → same. Supported phrases: see `packages/ai/src/dispatch/SUPPORTED_PHRASES.md`.

## M3.5 – AI-led agents (human in the loop)

- **Parts reconciliation:** `suggestPartsReconciliation(workOrders, trackingEvents)` → suggestions (parts_shipped / return_received); `suggestOpenCores(workOrders, options)` → open_cores list. Human approves before updating WO/parts.
- **Claim-processing:** `prepareClaim(wo)` → proposed_claim, ready_for_submit, denial_reasons; `proposeClaimStatusUpdate(providerResponse, wo)` after provider response. Human submits/approves.
- **Tech comms:** `suggestTechReminders(workOrders, options)` → pending_messages (appointment_reminder, parts_delivered_schedule, cores_return_reminder) with draft_content. Human approves before send.
- **API:** POST `/v1/ai/agents/parts/suggest`, `/v1/ai/agents/claims/prepare`, `/v1/ai/agents/claims/submission-payload`, `/v1/ai/agents/claims/ingest-response`, `/v1/ai/agents/tech-comms/suggest`. Invoke and approval flows: `packages/ai/src/agents/README.md`.

### M4.3 – Billing/claims automation (DIAG vs repair, deductions, submission, ingest)

- **DIAG vs repair:** `classifyBillingType(wo)` → `'diag'` \| `'repair'` (success + parts_used = repair; NPF/unreachable/no parts = diag). `applyDeductionRules(wo, options)` → deduction codes (unreachable, npf, tat_breach, parts_not_returned, etc.).
- **prepareClaim** now returns `billing_type`, `deductions`; optional `tatThresholdDays` for TAT breach.
- **Claim submission:** `buildClaimSubmissionPayload(wo, { provider_format: 'generic'|'oem'|'ext_warranty' })` → payload for provider API or batch. Human or system submits.
- **Ingest provider response:** `ingestProviderResponse(providerResponse, wo)` → `suggested_wo_updates` (metadata: claim_status, claim_denial_reason, claim_deduction_code); human approves before PATCH.
