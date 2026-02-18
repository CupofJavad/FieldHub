# M3.5 – AI-led agents (human in the loop)

All three agents **propose or draft**; a human **reviews/approves** before updating master data or sending messages. Per `SCT_System_Recreation_Project/SCT_AI_and_Human_Operating_Model.md`.

---

## 1. Parts reconciliation agent

**Invoke:**

- `suggestPartsReconciliation(workOrders, trackingEvents)` – match inbound tracking to WO parts; returns `{ suggestions }` (type `parts_shipped` or `return_received`). Human approves → then PATCH WO (e.g. status, parts array) or run internal “mark parts shipped / return received.”
- `suggestOpenCores(workOrders, { openAfterDays })` – flag WOs with open cores (expected return, no return_tracking); default 14 days. Returns `{ open_cores }`. Human uses list for 14–21 day reminders (content can be drafted by tech-comms agent).

**Approval flow:** Report Center or script calls suggest → UI shows suggestions / open_cores → human approves in bulk or one-by-one → system applies updates (e.g. PATCH work-orders, or mark “return received” in parts).

---

## 2. Claim-processing agent

**Invoke:**

- `prepareClaim(wo)` – map WO completion_payload to `proposed_claim` (result, parts_used, tat_days, etc.). Returns `{ proposed_claim, ready_for_submit, denial_reasons? }`. Human reviews → submit via provider API or batch (out of scope here); or correct and resubmit.
- `proposeClaimStatusUpdate(providerResponse, wo)` – after provider responds (approved/denied), get `{ suggested_action, update_claim_status, flag_for_human }`. Human decides to close claim or escalate.

**Approval flow:** Operator runs prepareClaim for completed WOs → reviews proposed_claim → submits to provider (or edits first). When provider responds, proposeClaimStatusUpdate → human closes or handles denial.

---

## 3. Outbound tech-communications agent

**Invoke:**

- `suggestTechReminders(workOrders, options)` – returns `{ pending_messages }`: appointment_reminder (e.g. 24h ahead), parts_delivered_schedule, cores_return_reminder (14+ days). Each has `draft_content`, `wo_id`, `type`, `rule`. Human approves/edit → then send via SMS/email/in-app (send mechanism out of scope; agent only drafts).

**Approval flow:** Report Center or cron calls suggestTechReminders → shows pending_messages → human approves or edits copy → system sends (or hands off to comms channel). No autonomous send without approval.

---

## API (optional)

- `POST /v1/ai/agents/parts/suggest` – body `{ work_orders, tracking_events? }` → suggestions + open_cores.
- `POST /v1/ai/agents/claims/prepare` – body `{ work_order }` → proposed_claim, ready_for_submit.
- `POST /v1/ai/agents/tech-comms/suggest` – body `{ work_orders, options? }` → pending_messages.

Human must approve before applying any suggestion or sending any message.
