# Outbound Platform API Validation – WorkMarket & Field Nation

**Purpose:** (1) State clearly that TGND’s current outbound integrations are **mock/scaffold** and have **not** been built or validated against the official platform APIs. (2) Describe the **intended design** (work backwards from platform docs → canonical model → input methods). (3) Give a concrete **validation and build plan** using the official docs so real integrations can be implemented and checked.

---

## 1. Current state (updated after incorporation)

- **WorkMarket:** The adapter has **both** mock and **real API paths**. When `WORKMARKET_API_KEY` (or options.apiKey) is set, it calls the WorkMarket Employer API: Create Access Token, Create Assignment, Edit Assignment (updateAppointment), Cancel Assignment, Get Assignment (getStatus). Field mapping: `docs/field-mapping-workmarket.md`. Confirm exact request body/endpoints at [WorkMarket Employer API](https://employer-api.workmarket.com/reference/getting-started).
- **Field Nation:** A **Field Nation adapter** is in `packages/outbound-adapters/src/fieldnation/` (mapper + adapter). It uses Field Nation Work Order Object, Locations, and Schedules for create payloads. Field mapping: `docs/field-mapping-fieldnation.md`. Webhook handler spec: `docs/WEBHOOK_FIELD_NATION_SPEC.md`. Adapter supports mock and real mode (`FIELD_NATION_OAUTH_TOKEN`).
- **Conclusion:** Both platforms are **incorporated** in code and docs: field mappings from official docs, adapters with TGND↔platform mapping, and (for Field Nation) webhook handler spec. Real endpoints may need adjustment when credentials are used.

---

## 2. Intended design (what you described)

Yes: the right approach is to **work backwards** from the platform APIs:

1. **Map platform → TGND:** Use each platform’s API reference to list the fields and workflows (e.g. WorkMarket **Create Assignment**, **List Assignments**, statuses; Field Nation **Create Work Order**, **Job Status**, **Webhooks** events). Map those fields and statuses into TGND’s **canonical work order model** (and lifecycle). Deduce the workflows (e.g. create → send → assigned → check-in → check-out → complete) and mirror them in TGND’s status transitions and outbound calls.
2. **Internal canonical version:** TGND keeps a single internal representation (the canonical WO: external_id, provider_key, payer_type, service_type, status, product, problem, ship_to, appointment_date, parts, pricing, platform_job_id, platform_type, etc.). All outbound platforms are mapped **from** this canonical model; all inbound inputs are mapped **into** it.
3. **Data upload/input methods:** Once the canonical model is aligned with the platforms (and with SCT-style requirements), build the **inbound** methods that feed that model: FTP import, manual form, EDI, REST/GraphQL API, webhooks, batch CSV, etc. (as in the SCT docs and `SCT_Enhanced_System_Design_And_Build_Scope.md`). So: **platform APIs (and webhooks) → canonical model ← FTP / form / EDI / API / etc.**

That is the correct architecture. TGND’s current codebase implements the **scaffold** (canonical model, adapter interface, mock WorkMarket); it has **not** yet been validated or implemented against the two links you provided.

---

## 3. Validation and build plan (using the docs you linked)

Use the following to build and validate real integrations and field accuracy.

### 3.1 WorkMarket Employer API

- **Docs:** [WorkMarket Employer API – Getting Started](https://employer-api.workmarket.com/reference/getting-started); then **Authorization** (Create Access Token), **Assignments** (Create Assignment, Edit Assignment, List Assignments, Get Assignment, Send Assignment, Cancel Assignment, Void Assignment, Complete Assignment, etc.).
- **Steps:**
  1. **Field mapping table:** From the API reference, list every field used in **Create Assignment** and **Edit Assignment** (and any assignment response). Map each to TGND canonical (e.g. WorkMarket `title` / `description` → TGND `problem` / `instructions`; WorkMarket location/address → TGND `ship_to`; WorkMarket scheduled date/time → TGND `appointment_date`; WorkMarket assignment id → TGND `platform_job_id`). Document in this repo (e.g. `docs/field-mapping-workmarket.md`).
  2. **Workflow alignment:** List WorkMarket assignment statuses and actions (e.g. create → send → accept/decline → check-in → check-out → complete). Ensure TGND’s lifecycle (`received` → `scheduling` → `assigned` → `in_progress` → `completed` / `cancelled`) and adapter methods (push, updateAppointment, cancel, getStatus) map correctly. Add any missing TGND fields or statuses if the platform requires them.
  3. **Implementation:** Replace the mock in `packages/outbound-adapters/src/workmarket/adapter.js` with real HTTP calls (Create Access Token, then Create Assignment, Edit Assignment, etc.). Use env for credentials (e.g. `WORKMARKET_API_KEY` or OAuth client). Store returned assignment id as `platform_job_id` on the TGND WO.
  4. **Status sync:** Use WorkMarket’s assignment status APIs (or webhooks if they offer them) to update TGND WO status (e.g. when assignment is completed or cancelled). Implement polling via Get Assignment and/or webhook handler if available.

### 3.2 Field Nation Client API & Webhooks

- **Docs:** [Field Nation – Webhooks Overview](https://developer.fieldnation.com/client-api/webhooks/howitworks/); then **REST API** (Create Work Order, Get Work Orders, Update Work Order Job Status, etc.) and **Webhooks API** (Events, Status Changes: Draft, Routed, Published, Assigned, Confirmed, Provider Checked In/Out, Work Done, Approved, Paid, Cancelled, etc.).
- **Steps:**
  1. **Field mapping table:** From Field Nation’s “Create Work Order” and “Work Order” object docs, list all fields. Map to TGND canonical (e.g. location, schedule, custom fields, status). Document in `docs/field-mapping-fieldnation.md`.
  2. **Workflow alignment:** Map Field Nation status changes (Draft → Routed → Published → Assigned → Confirmed → … → Work Done → Approved → Paid / Cancelled) to TGND lifecycle. Ensure TGND can send work orders to Field Nation and receive status updates via webhooks.
  3. **Implementation:** Add a Field Nation adapter in `packages/outbound-adapters` (e.g. `fieldnation/adapter.js`) implementing the same interface (push, updateAppointment, cancel, getStatus). Use Field Nation’s REST API for create/update and register a webhook URL for status changes.
  4. **Webhook handler:** Implement `POST /webhooks/field/fieldnation` (or similar) that receives Field Nation webhooks, verifies signature per their “Securing Webhooks” docs, maps event/status to TGND WO, and PATCHes the WO (and optionally stores completion payload). Document which events and status changes are handled.

### 3.3 TGND canonical model

- **Review:** After both mapping tables exist, review TGND’s canonical WO schema (and `packages/canonical-model`, `apps/api` routes, `db` schema) to ensure it has every field needed for both platforms (and for SCT-style inbound: FTP, EDI, form, API). Add columns or JSONB metadata where a platform requires a field that doesn’t yet exist in canonical. Prefer one canonical field with a clear name over platform-specific columns when possible.

### 3.4 Inbound methods (after canonical is validated)

- Once the canonical model is validated against WorkMarket and Field Nation (and any other platforms), the **inbound** methods (FTP import, manual form, EDI, API, webhooks) in the SCT docs and enhanced design should all map **into** that same canonical model. No change to the “work backwards” idea: platforms define the target shape; canonical is the internal mirror; inputs feed canonical.

---

## 4. Who does this

- **Sam** (Field Platform & Outbound) is the natural owner for implementing and validating WorkMarket and Field Nation adapters using the above plan and the two doc links. Coordination with **Corey** for any canonical/db changes and with **Archie** for prioritization.
- **Deliverables:** (1) Field mapping docs for WorkMarket and Field Nation, (2) real WorkMarket adapter (no mock) when credentials are available, (3) Field Nation adapter + webhook handler, (4) any canonical/db updates needed so all platform fields are representable.

---

## 5. References

- [WorkMarket Employer API – Getting Started](https://employer-api.workmarket.com/reference/getting-started)
- [Field Nation – Webhooks Overview](https://developer.fieldnation.com/client-api/webhooks/howitworks/)
- TGND: `SCT_System_Recreation_Project/SCT_Enhanced_System_Design_And_Build_Scope.md` (§5 Outbound, §3.1 Canonical); `packages/outbound-adapters`; `docs/PHASE1_M1.2_M1.5_HANDOFF.md`

---

*This document confirms that the current integrations were not validated against the two links and provides the plan to do so. The design you described (work backwards from platform APIs → internal canonical → then input methods) is correct and is how TGND should be built and validated going forward.*
