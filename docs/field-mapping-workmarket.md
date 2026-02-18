# WorkMarket ↔ TGND Canonical Field Mapping

**Source:** [WorkMarket Employer API – Getting Started](https://employer-api.workmarket.com/reference/getting-started). API includes: **Authorization** (Create Access Token), **Assignments** (Create Assignment, Edit Assignment, List Assignments, Get Assignment, Send Assignment, Cancel Assignment, Void Assignment, Complete Assignment, etc.).

**Note:** The exact request/response JSON for Create Assignment and Edit Assignment should be taken from the official WorkMarket Employer API reference (e.g. [employer-api.workmarket.com](https://employer-api.workmarket.com/reference/getting-started) or [work-market-employer-api.readme.io](https://work-market-employer-api.readme.io/docs)) when implementing. The table below is a typical mapping for assignment-based platforms.

---

## TGND canonical → WorkMarket (outbound: create/send assignment)

| TGND canonical field | WorkMarket (typical assignment) | Notes |
|----------------------|----------------------------------|--------|
| id | (not sent; WM returns assignment id) | Store WorkMarket assignment id as platform_job_id in TGND. |
| problem / instructions | title / description | Assignment title and description. |
| ship_to (name, address, city, state, zip, phone) | location / address | WorkMarket assignment location. Use exact field names from Create Assignment API. |
| appointment_date | scheduledDate / startDate / dueDate | Assignment scheduled date/time; use format required by API. |
| requested_date_start / requested_date_end | (window or end date) | If API supports window. |
| product (brand, model, serial) | custom fields / description | |
| service_type | assignment type / category | Map TGND service_type to WorkMarket type/category if required. |
| pricing (labor, parts) | budget / pay / pricing | Use WorkMarket pay or budget fields per API. |

**Implementation:** Call **Create Access Token** (POST) with credentials, then **Create Assignment** (POST) with body derived from TGND WO. Store returned assignment id as `platform_job_id`. **Send Assignment** to publish to talent pool if required by workflow.

---

## WorkMarket → TGND (inbound: status / completion)

| WorkMarket (assignment) | TGND canonical | Notes |
|--------------------------|----------------|--------|
| assignment id | platform_job_id | Look up TGND WO by platform_job_id. |
| status (e.g. open, sent, accepted, in_progress, completed, cancelled) | status | Map to TGND: received → scheduling → assigned → in_progress → completed / cancelled. |
| completion result / notes | completion_payload or metadata | For billing and claims. |

Use **Get Assignment** to poll status, or WorkMarket webhooks if available (check [WorkMarket Developer Portal](https://developer.workmarket.com/) or [webhook-recipes](https://github.com/workmarket/webhook-recipes)). When assignment is completed or cancelled, PATCH TGND WO status and optionally store completion payload.

---

## WorkMarket adapter implementation checklist

1. **Auth:** Create Access Token (POST); use token in Authorization header for subsequent calls.
2. **Create Assignment:** POST with body from TGND mapping above; confirm required vs optional fields from API reference.
3. **Send Assignment:** If workflow requires a separate "send" step after create.
4. **Edit Assignment:** For updateAppointment (PATCH/PUT with new date).
5. **Cancel / Void Assignment:** For cancel(platformJobId, reason).
6. **Get Assignment:** For getStatus(platformJobId) polling.
7. **Complete Assignment (on behalf of worker):** When marking job complete; map to TGND completed + completion_payload.

Store `WORKMARKET_API_KEY` or OAuth client credentials in env; do not commit. See `packages/outbound-adapters/src/workmarket/adapter.js` for interface; replace mock branch with real HTTP calls using the mapping above and the official API docs.
