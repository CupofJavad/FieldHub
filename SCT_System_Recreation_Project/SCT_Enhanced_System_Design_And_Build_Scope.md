# SCT Enhanced System: Design & Build Scope

**Purpose:** Design and build scope for an enhanced field-service platform that (1) receives inbound work orders from manufacturers/OEMs, extended-warranty providers, and out-of-warranty customers via API, EDI, and other modern data channels; (2) handles configurable service types and completion workflows; (3) pushes work to on-demand field-tech platforms and keeps status in sync; and (4) incorporates AI to improve routing, scheduling, and operations.  
**Audience:** Javad (build owner). Build is scoped so it can be implemented in your environment (single developer or small team, cloud or local).

**Relationship:** Extends [SCT_Design_Scope_System_Portal_App.md](./SCT_Design_Scope_System_Portal_App.md) with modern ingestion, service-type engine, outbound platform integration, and AI.

---

## 1. Executive Summary

### 1.1 What You’re Building

A **central field-service orchestration system** that:

| Layer | Responsibility |
|-------|----------------|
| **Inbound** | Accept work orders from OEMs (in-warranty), extended-warranty companies, and out-of-warranty (customer-pay) via **REST/GraphQL API**, **webhooks**, **EDI**, **event streams**, **batch files (SFTP/S3)**, and **message queues**. |
| **Core** | Normalize to a single work-order model, apply **service-type** logic (OSR, OSS/Last Mile, installation, depot, etc.), manage parts/cores, and enforce lifecycle and billing rules. |
| **Outbound** | Publish jobs to **on-demand field-tech platforms** (WorkMarket, Field Nation, OnForce-style, etc.) via their APIs; consume status updates (accept, complete, reschedule) and sync back. |
| **AI** | Optional layer for **smart routing/scheduling**, **skill matching**, **anomaly detection**, **conversational dispatch**, and **document/notes extraction**. |

### 1.2 Provider and Payer Types

| Provider / Payer | In-warranty / Program | Typical ingestion | Notes |
|------------------|------------------------|-------------------|--------|
| **Manufacturers / OEMs** | In-warranty | EDI (ASN, 856), API, batch CSV/SFTP | VIZIO, Hisense, TPV, Wistron, Amtran, etc.; PO/RMA, serial, model, ship-to. |
| **Extended warranty** | Extended warranty | API, webhooks, portal sync (e.g. Service Bench) | NEW/Asurion; auth, DIAG vs repair, claim rules. |
| **Customer (out-of-warranty)** | Customer pay | API, web portal, IVR/CRM | Out-of-pocket; payment and pricing handled in your system or gateway. |

### 1.3 Modern Data Communication Methods (Beyond API and EDI)

| Method | Use in this system | When to use |
|--------|--------------------|-------------|
| **REST API** | Providers push work orders; you expose status/audit APIs | Preferred for OEMs and warranty providers with dev resources. |
| **GraphQL API** | Flexible query for portals and internal tools; optional subscription for real-time | When consumers need ad-hoc fields and you want one endpoint. |
| **Webhooks** | Providers register endpoints; you push “work order created/updated/completed” | Real-time downstream (e.g. provider systems, analytics). |
| **EDI (X12 / EDIFACT)** | 850 (PO), 856 (ASN), 810 (invoice), 997 (ack) | Legacy OEMs and retailers; keep for compatibility. |
| **Event streaming** | Internal: “OrderReceived”, “PartsShipped”, “TechAssigned”, “Completed” | Decouple ingestion from processing; feed AI and analytics. |
| **Message queue (e.g. SQS, RabbitMQ, Redis Streams)** | Reliable ingestion: API writes to queue; workers process idempotently | High volume; at-least-once processing with retries. |
| **Batch file (SFTP, S3, FTP)** | CSV/XML drops (e.g. daily CRM, EOD, manifest) | Hisense-style flows; providers without real-time API. |
| **Change Data Capture (CDC)** | If you ever sync from a legacy DB (e.g. existing SCT DB) | Migrations or hybrid during cutover. |

---

## 2. System Architecture (High Level)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROVIDERS (Inbound)                                     │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┤
│ OEM/Manufacturer │ Ext Warranty │ Customer Pay  │ Batch/Legacy  │ (Future)          │
│ (in-warranty)   │ (NEW, etc.)  │ (portal/API)  │ (SFTP, EDI)   │                    │
└───────┬────────┴──────┬───────┴──────┬───────┴──────┬───────┴──────────────────────┘
        │               │             │              │
        ▼               ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    INBOUND LAYER (Your environment)                               │
│  REST/GraphQL API  │  Webhooks (in)  │  EDI (850/856)  │  Queue  │  SFTP/S3 batch  │
└───────────────────────────────┬─────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    NORMALIZATION & VALIDATION                                      │
│  Schema mapping per provider  │  Idempotency keys  │  Validation  │  Enrichment   │
└───────────────────────────────┬─────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CORE: Work Order & Service Type Engine                          │
│  WO lifecycle  │  Service types (OSR, OSS, Install, Depot)  │  Parts/cores  │  Rules │
└───────────────────────────────┬─────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌───────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Event stream │    │  Report Center       │    │  AI layer (optional) │
│  (internal)   │    │  TAT, assign, parts  │    │  Route, schedule,    │
│  + webhooks   │    │  billing, claims     │    │  match, predict     │
└───────┬───────┘    └─────────────────────┘    └──────────┬──────────┘
        │                                                   │
        ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    OUTBOUND: Field Tech Platforms                                 │
│  WorkMarket API  │  Field Nation  │  OnForce-style  │  (Custom pool / WWTS-like)   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Inbound: Receiving Work Orders from Providers

### 3.1 Unified Inbound Work Order Model (Canonical)

Every provider payload is mapped to a **canonical work order** in your system. Suggested minimal schema:

| Field | Type | Notes |
|-------|------|--------|
| `id` | UUID | Internal primary key. |
| `external_id` | string | Provider’s reference (e.g. PO, RMA, ticket #). |
| `provider_key` | enum/string | e.g. `oem_vizio`, `oem_hisense`, `ext_warranty_new`, `customer_pay`. |
| `payer_type` | enum | `oem_in_warranty` \| `ext_warranty` \| `customer_pay`. |
| `service_type` | enum | `osr` \| `oss_last_mile` \| `installation` \| `depot_repair` \| etc. (see §4). |
| `status` | enum | `received` \| `parts_ordered` \| `parts_shipped` \| `scheduling` \| `assigned` \| `completed` \| `cancelled` \| … |
| `product` | object | Brand, model, serial (optional). |
| `problem` | string | Description or problem code. |
| `instructions` | string | Special instructions. |
| `ship_to` | address | EU address or tech office; name, address, city, state, zip, phone. |
| `requested_date_start` / `requested_date_end` | date | Requested window. |
| `appointment_date` | datetime | Confirmed appointment (when set). |
| `parts` | array | Part numbers, qty, tracking, return tracking, vendor tail (e.g. -1, -2). |
| `pricing` | object | Labor, parts, auth limit, currency (for customer pay: amount due). |
| `metadata` | JSONB | Provider-specific raw or mapped fields. |
| `created_at`, `updated_at` | timestamp | Audit. |

Idempotency: use `provider_key + external_id` (and optionally `idempotency_key` from provider) so the same order is not duplicated.

### 3.2 Inbound Channels (Implementation Scope)

#### 3.2.1 REST API (Primary for modern providers)

- **POST /v1/work-orders** – Create work order; body = canonical or provider-specific schema; response = `id`, `external_id`, `status`.
- **GET /v1/work-orders/:id** – By internal id or by `?provider= &external_id=`.
- **PATCH /v1/work-orders/:id** – Status/field updates (if provider is allowed).
- Auth: API key or OAuth2 per provider (stored in config/env).
- Rate limit and request logging for safety.

#### 3.2.2 Webhooks (Provider → You)

- Less common for *inbound* work orders (usually you call their API or they call yours). Use when a provider pushes “new order” to a URL you give them.
- **POST /webhooks/:provider** – Verify signature; parse payload; enqueue to internal queue; return 200 quickly; process async (queue-first, idempotent).
- Best practice: acknowledge in &lt; 5s; process in worker; retries with backoff; dead-letter queue for failures.

#### 3.2.3 EDI (X12)

- **850** (Purchase Order) / **856** (ASN) – Map to canonical WO; extract PO, line items, ship-to, dates.
- Use an EDI parser library or small service (e.g. Python `petl`, Node `x12-parser`, or cloud EDI service). Output → same canonical model → enqueue or write to DB.
- **997** (Functional Ack) – Send back to provider after acceptance.

#### 3.2.4 Event streaming (internal)

- After normalization, publish events to an internal stream (e.g. Redis Streams, Kafka, or SQS): `WorkOrder.Received`, `WorkOrder.PartsShipped`, `WorkOrder.Assigned`, `WorkOrder.Completed`.
- Consumers: outbound sync, AI pipeline, Report Center, webhooks (you → external systems).

#### 3.2.5 Message queue (reliable ingestion)

- API and webhook handlers write to a queue (e.g. SQS, RabbitMQ, Redis Streams); workers pull and upsert work orders with idempotency.
- Decouples burst traffic from DB and allows retries without blocking the HTTP response.

#### 3.2.6 Batch file (SFTP / S3 / FTP)

- Scheduled jobs (cron or queue-triggered): watch folder or S3 prefix; read CSV/XML; map columns to canonical; upsert by `provider_key + external_id`.
- Same validation and enrichment as API path (e.g. geo from zip, default service type).

### 3.3 Provider-Specific Mapping (Examples)

| Provider type | Typical fields | Mapping notes |
|---------------|----------------|---------------|
| **OEM (VIZIO/TPV style)** | PO, RMA#, Model, Serial, Problem, Ship-to, OSR Creation Date | Map to canonical; set `payer_type=oem_in_warranty`, `service_type=osr` (or from problem code). |
| **Extended warranty (NEW)** | Auth #, limit, DIAG vs repair, part escalation | Set `payer_type=ext_warranty`; attach auth and claim rules to WO. |
| **Customer pay** | Name, address, phone, product, problem, payment ref | Set `payer_type=customer_pay`; link to payment (Stripe, etc.) if needed. |

---

## 4. Service Types and Completing Work Orders

### 4.1 Service Type Catalog (Configurable)

Each work order has a **service type** that drives workflow, screens, and rules.

| Service type | Description | Key steps (from SCT legacy) |
|--------------|-------------|-----------------------------|
| **OSR** (On-Site Repair) | In-home repair; parts to EU or tech | Receive → parts order/ship → track parts → schedule → assign tech → complete (unit condition, parts used, return) → close & bill. |
| **OSS / Last Mile** | Delivery + install + swap (new unit in, old out) | Confirm EU → set appointment → dispatch to terminal → confirm OSS# → inspect at terminal → deliver → inspect old unit → pack/return cores. |
| **Installation** | Install only (e.g. mount, connect) | Schedule → assign → complete (install checklist) → close. |
| **Depot / mail-in** | Unit sent to depot; repair and return | Receive unit → repair → ship back; track RMA and tracking. |
| **Inspection / audit** | No repair; document condition | Schedule → assign → complete (photos, notes) → close. |

You can add more (e.g. **Panel replacement**, **Warranty exchange**) and drive behavior from a **service_type_config** table (e.g. required statuses, required fields for completion, billing rules).

### 4.2 Work Order Lifecycle (Generic)

1. **Received** – Inbound created the WO; validation passed.
2. **Parts** – Parts ordered and optionally shipped (tracking stored); for OSR, “need to schedule” when parts landed.
3. **Scheduling** – Appointment window or confirmed appointment set.
4. **Assigned** – Pushed to field platform; tech accepted (if platform confirms).
5. **In progress** – Tech en route or on site (if platform supports).
6. **Completed** – Tech completed; completion payload received (result, parts used, condition, return tracking).
7. **Closed** – Billing/claims applied; no further state changes.
8. **Cancelled** – Anytime; reason and sync to provider if needed.

Transitions can be validated in code (e.g. “Completed” only from “Assigned” or “In progress”).

### 4.3 Completion Payload (From field platform or portal)

When a tech (or back-office) marks a job complete, you need:

- **Result:** success / no problem found / defective panel / unreachable / reschedule / etc.
- **Parts used:** part numbers, qty; **return tracking** for cores.
- **Unit condition:** before/after; photos optional (store URLs or refs).
- **Signature / proof:** optional (e.g. base64 or link).

This feeds **billing** (DIAG vs full repair, deductions) and **claims** (rejection reasons, time limits). Same canonical “completion” model regardless of which field platform sent it.

---

## 5. Outbound: Integrating with On-Demand Field Tech Platforms

### 5.1 Role of Your System

- **You are the source of truth** for work order and service type.
- You **push** jobs to one or more platforms (WorkMarket, Field Nation, custom pool) with routing rules (zip, radius, skills).
- You **receive** status updates (accepted, completed, rescheduled, cancelled) via their API webhooks or polling, and update your WO and event stream.

### 5.2 Generic Outbound Abstraction

Define a **field platform adapter** interface (e.g. in code):

- **push(workOrder)** → returns platform job id and optional deep link.
- **updateAppointment(platformJobId, appointmentDate)**.
- **cancel(platformJobId, reason)**.
- **getStatus(platformJobId)** → optional polling fallback.

Each platform (WorkMarket, Field Nation, etc.) implements this adapter using their REST API. Your core only calls the interface.

### 5.3 Mapping to Platform-Specific Models

- Map your **canonical WO** to the platform’s job schema (title, description, address, required skills, pay, appointment window).
- Store **platform_job_id** and **platform_type** on your WO so you can correlate callbacks.
- When platform sends “completed” or “status changed,” map back to your completion payload and lifecycle (e.g. status → Completed, then run billing/claim rules).

### 5.4 Sync and Reliability

- **Outbound:** Retry with backoff if push fails; store “pending_push” and reprocess.
- **Inbound from platform:** Prefer **webhooks** from platform to your **POST /webhooks/field/:platform**; verify signature; enqueue; update WO and publish internal events.
- If no webhooks, **poll** platform API periodically for job status and diff against your DB.

---

## 6. AI System and Improvements

### 6.1 Where AI Fits

| Area | AI use | Benefit |
|------|--------|---------|
| **Routing & assignment** | Recommend or auto-assign tech by location, skills, capacity, and job type | Fewer “no flow” cases; better first-time fix. |
| **Scheduling** | Suggest appointment windows or optimize route (cluster nearby jobs, traffic) | Less travel time; fewer missed appointments. |
| **Matching** | Match job requirements (model, problem code) to tech certifications/experience | Higher completion and lower callback rate. |
| **Demand / capacity** | Forecast volume by region and service type | Staffing and talent pool sizing. |
| **Anomaly detection** | Flag odd TAT, high rejection rate, or stuck WOs | Early escalation. |
| **Conversational dispatch** | Natural language “schedule the next available for zip 95834” → run scheduling | Faster back-office. |
| **Document/notes** | Extract problem, model, serial from free text or PDF | Less manual data entry. |

### 6.2 Implementation Options (Buildable in your environment)

- **Routing/scheduling:**  
  - **Rule-based first:** zip, radius, skills from config; then add **scoring** (distance, utilization, historical completion).  
  - **ML later:** train a small model (e.g. XGBoost or simple NN) on historical “good” assignments (completed on time, high rating) vs “bad” (late, NPF, unreachable); use for “recommend top 5 techs.”

- **Anomaly detection:**  
  - Simple: thresholds (e.g. TAT &gt; 7 days → alert).  
  - Better: time-series or isolation forest on TAT, rejection rate, or volume by provider/zip; run daily or on event.

- **Document/notes extraction:**  
  - Use an LLM (e.g. OpenAI/Anthropic API or local model) with a prompt: “From this note, extract: product model, serial, problem description, requested date.” Output structured JSON into your WO or as suggestion for an operator.

- **Conversational dispatch:**  
  - Same LLM: “User said: schedule the VIZIO repair for 123 Main St for tomorrow afternoon.” → Parse intent and entities → call your internal API (create or update WO, trigger scheduling).

### 6.3 Data You Need for AI

- Historical WOs: provider, service type, zip, requested/completed dates, tech (if any), result (success/NPF/unreachable), TAT.
- Tech master: id, zip, skills/certs, platform, historical completion and TAT.
- Optional: traffic or distance matrix (e.g. Google Distance Matrix API or precomputed zip-to-zip).

Start with **rule-based + simple thresholds**; add ML/LLM once you have a few months of data and clear metrics.

---

## 7. Build Scope and Phased Plan (Your Environment)

### 7.1 Assumptions

- **You (Javad)** are the primary builder; stack should be manageable by one person or a small team.
- **Environment:** Local (Docker) or cloud (e.g. AWS, Railway, Render, Vercel + serverless). DB: Postgres (local or managed). Queue: Redis Streams or SQS. Optional: serverless functions for webhooks.
- **Providers:** Start with 1–2 (e.g. one API provider + one batch/EDI). Add more per phase.
- **Field platforms:** Start with one (e.g. WorkMarket or Field Nation); add adapters over time.

### 7.2 Suggested Tech Stack

| Layer | Option A (simpler) | Option B (scalable) |
|-------|--------------------|----------------------|
| **API** | Node (Express/Fastify) or Python (FastAPI) | Same + GraphQL (Apollo or Strawberry) |
| **DB** | Postgres (single instance) | Postgres + read replica later |
| **Queue** | Redis (BullMQ or Redis Streams) | SQS or RabbitMQ |
| **Events** | Redis Streams or DB + polling | Kafka or SQS fan-out |
| **EDI** | Python script or small service (petl + x12) | Same or cloud EDI (e.g. Adeptia, Boomi) |
| **Portal (admin)** | Next.js or SvelteKit on same repo | Separate repo; same API |
| **AI** | External API (OpenAI/Anthropic) for extraction and chat; rules for routing | Same + optional SageMaker or Vertex for custom models later |

### 7.3 Phased Build Plan

#### Phase 1: Inbound + Core WO + One outbound (MVP)

- **Inbound:**  
  - REST API: `POST/GET/PATCH /v1/work-orders` with canonical model and idempotency.  
  - One provider mapping (e.g. “mock OEM” or one real OEM CSV/API).  
  - Optional: one batch job (SFTP or S3) for CSV.
- **Core:**  
  - Postgres: `work_orders`, `providers`, `service_type_config`.  
  - Lifecycle state machine (received → … → completed/closed/cancelled).  
  - No full “service type engine” yet; default to OSR.
- **Outbound:**  
  - One field platform adapter (e.g. WorkMarket): push job, store platform_job_id; receive webhook or poll for status → update WO.
- **Deliverable:** Provider can create WOs; you assign to one platform; completion updates WO status.

**Rough duration:** 6–10 weeks part-time.

---

#### Phase 2: Service types + Report Center + More channels

- **Service types:**  
  - Table-driven or code-driven workflows per `service_type` (OSR vs OSS vs installation); completion validation and required fields.
- **Report Center:**  
  - Dashboards: open WOs by status, TAT (request → complete), tech assign, parts return status (like “WWTS-style” in SCT doc).  
  - Export: CSV/Excel for billing and claims.
- **Inbound:**  
  - Add EDI (850/856) or second provider (e.g. extended warranty API).  
  - Webhooks from providers if needed.
- **Outbound:**  
  - Second field platform adapter (or custom pool with simple “assign to tech” UI).
- **Deliverable:** Multiple service types, basic reporting, 2+ inbound channels, 2 platforms or 1 platform + internal assign.

**Rough duration:** 6–8 weeks after Phase 1.

---

#### Phase 3: AI layer and automation

- **Routing:**  
  - Rule-based assignment (zip, radius, skills) with config; optional “recommend top N techs” using simple scoring or a small ML model.
- **Scheduling:**  
  - Suggest appointment windows; optional route clustering (e.g. same-day nearby jobs).
- **Anomaly:**  
  - Alerts for TAT &gt; threshold, rejection spike, or stuck WOs.
- **Document/notes:**  
  - LLM endpoint: “extract WO fields from this text” for manual entry or batch import.
- **Conversational (optional):**  
  - Simple chat or slash-command that parses “schedule …” and calls your API.
- **Deliverable:** Smarter assignment, alerts, and less manual data entry.

**Rough duration:** 4–6 weeks after Phase 2.

---

#### Phase 4: Scale and polish

- **Providers:**  
  - More OEMs, more warranty providers, customer-pay portal (create WO from form + payment).
- **Platforms:**  
  - More field adapters; unified “pool” view (same WO visible across platforms).
- **Billing/claims:**  
  - Automated billing rules (DIAG vs repair, deductions); claim submission to providers (API or file).
- **Security and ops:**  
  - API keys per provider; audit log; rate limits; backup and monitoring.
- **Deliverable:** Production-ready multi-tenant-style ingestion, multi-platform dispatch, and billing/claims automation.

**Rough duration:** 8–12 weeks depending on number of integrations.

---

### 7.4 File and Repo Structure (Suggested)

```
repo/
├── apps/
│   ├── api/                 # REST ( + optional GraphQL )
│   ├── workers/             # Queue workers (ingest, outbound sync, AI)
│   └── portal/              # Next.js or SvelteKit admin + Report Center
├── packages/
│   ├── canonical-model/     # WO, provider, service type types/schemas
│   ├── inbound-adapters/    # REST handler, EDI parser, batch CSV
│   ├── outbound-adapters/   # WorkMarket, Field Nation, …
│   └── ai/                  # Routing rules, LLM extraction, anomaly
├── db/
│   ├── migrations/
│   └── seeds/
├── docker-compose.yml       # Postgres, Redis, optional local EDI
└── docs/
    ├── SCT_Design_Scope_System_Portal_App.md
    ├── SCT_Enhanced_System_Design_And_Build_Scope.md  # this doc
    ├── SCT_End_User_Workflows_And_Processes.md
    └── SCT_AI_and_Human_Operating_Model.md
```

---

## 8. Summary Tables

### 8.1 Inbound Methods

| Method | Purpose | Build phase |
|--------|---------|-------------|
| REST API | Primary ingestion for OEM/warranty/customer-pay | 1 |
| Webhooks (provider → you) | Real-time push from provider | 2 |
| EDI (850/856) | Legacy OEM/retailer | 2 |
| Event stream (internal) | Decouple and feed AI/analytics | 2–3 |
| Message queue | Reliable, async ingest | 1–2 |
| Batch (SFTP/S3) | CSV/XML from Hisense-style flows | 1 |
| GraphQL | Optional query/subscription for portal | 2 |

### 8.2 Service Types (from SCT + enhanced)

| Type | Workflow focus |
|------|----------------|
| OSR | Parts → schedule → assign → complete (parts + return) → bill |
| OSS / Last Mile | Confirm EU → terminal → deliver → swap → return cores |
| Installation | Schedule → assign → complete checklist |
| Depot | Receive unit → repair → return ship |
| Inspection | Schedule → assign → document condition |

### 8.3 AI Capabilities

| Capability | Approach | Phase |
|------------|----------|--------|
| Routing / assignment | Rules + scoring; optional ML | 3 |
| Scheduling / clustering | Rules + optional optimization | 3 |
| Anomaly detection | Thresholds + optional time-series | 3 |
| Document extraction | LLM API | 3 |
| Conversational dispatch | LLM + intent → API | 3–4 |

### 8.4 Outbound

| Item | Phase |
|------|--------|
| One field platform adapter (e.g. WorkMarket) | 1 |
| Second platform or internal assign UI | 2 |
| Webhook ingestion from platform for status | 1 |
| More adapters and unified pool view | 4 |

---

## 9. Success Criteria (Checklist)

- [ ] At least one **provider** can create work orders via **API** and (optionally) **batch/EDI**.  
- [ ] Work orders are **normalized** to a single canonical model and **idempotent** by provider + external_id.  
- [ ] **Service types** (OSR, OSS, etc.) drive lifecycle and completion rules.  
- [ ] At least one **field tech platform** receives jobs from your system and **status updates** flow back.  
- [ ] **Report Center** provides TAT, assign, and parts return visibility.  
- [ ] **AI** improves assignment or scheduling (rules or ML) and/or extracts data from notes (LLM).  
- [ ] System runs in **your environment** (Docker or cloud) with one main codebase and clear phases.

---

---

## 10. References

- **SCT legacy design:** [SCT_Design_Scope_System_Portal_App.md](./SCT_Design_Scope_System_Portal_App.md) (same folder).
- **AI vs human operating model:** [SCT_AI_and_Human_Operating_Model.md](./SCT_AI_and_Human_Operating_Model.md) (same folder)—which processes are AI-led vs human-only (e.g. inbound calls, on-site tech).
- **Modern integration:** API-first patterns, webhooks (queue-first, idempotent, retries), event-driven and message-queue ingestion, EDI in iPaaS; MuleSoft, Integrate.io, Airbyte, Microsoft industry cloud data integration patterns.
- **AI in field service:** Salesforce Field Service AI guide; AI scheduling (skill matching, routing, real-time adjustments); Timefold field-service routing; SAP FSM AI scheduling; conversational dispatch (e.g. natural language scheduling).
- **Event streaming / webhooks:** NewStore-style event stream (webhook + S3 batch); GraphQL + event stream for hybrid query/real-time; exponential backoff and dead-letter for failed deliveries.

---

*This document is the design and build scope for the enhanced SCT-style system. Adjust phases and stack to match your availability and provider contracts; the architecture remains valid for API, EDI, webhooks, event streaming, queue-based ingestion, service-type engine, outbound platform integration, and optional AI.*
