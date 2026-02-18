# SCT System: End-User Workflows and Processes

**Purpose:** Describe who uses the system and how they use it—step-by-step workflows and processes from each end user’s perspective.  
**Basis:** [SCT_Design_Scope_System_Portal_App.md](./SCT_Design_Scope_System_Portal_App.md) and [SCT_Enhanced_System_Design_And_Build_Scope.md](./SCT_Enhanced_System_Design_And_Build_Scope.md).

---

## 1. End Users (Who Uses the System)

| End user | Role | Primary touchpoints |
|----------|------|----------------------|
| **Provider staff** (OEM, extended warranty, customer-pay) | Create and track work orders; view status and reports | API, portal (client login), batch file upload, EDI |
| **Back-office / operations** (internal: dispatchers, coordinators, billing) | Receive orders, manage parts, schedule, assign techs, run reports, handle claims | SCT system UI, Report Center, Service Bench, Onforce, WWTS, TWG/ServiceApp |
| **Technicians** (field) | Accept jobs, go on site, complete work, document results and parts | OnForce, WorkMarket, or other field platform (app or web) |
| **End customer (EU)** | Get service; track order; confirm appointment | Customer tracking page, IVR, phone/email/SMS |
| **Internal admin / IT** | Configure providers, service types, routing rules, integrations | Admin UI or config (in enhanced system) |

---

## 2. Provider Staff Workflows

Providers are manufacturers/OEMs (in-warranty), extended-warranty companies, or channels that submit customer-pay work. Their staff either submit work orders or monitor them.

### 2.1 Submitting Work Orders (Inbound)

**Ways to submit (depends on how the provider is integrated):**

1. **API (REST)**  
   - Provider’s system or staff calls **POST /v1/work-orders** with order details (e.g. PO, RMA, model, serial, problem, ship-to address, requested date).  
   - **User flow:** Provider staff use their own internal tool or ERP; that system sends the API request. No direct use of SCT UI.  
   - **Outcome:** System returns work order id and status (e.g. `received`). Provider stores the id or external_id for tracking.

2. **Portal (client login)**  
   - Provider staff log into the SCT portal with client credentials (e.g. VizioUser, OEM-specific login).  
   - **User flow:** Log in → create or upload work order (form or file) → submit.  
   - **Outcome:** Order appears in the system; they can look it up later by PO/RMA or order number.

3. **Batch file (SFTP / S3 / FTP)**  
   - Provider drops a CSV or XML file (e.g. daily CRM, EOD file) into a designated folder.  
   - **User flow:** Provider staff (or their system) generate the file and upload to the agreed path.  
   - **Outcome:** A scheduled job picks up the file, maps rows to work orders, and creates/updates them (idempotent by provider + external_id).

4. **EDI (850/856)**  
   - Provider sends an EDI purchase order (850) or advance ship notice (856).  
   - **User flow:** Handled by provider’s EDI/ERP; no manual SCT UI.  
   - **Outcome:** EDI is parsed; work orders are created (and 997 ack sent back).

### 2.2 Tracking and Status (Provider View)

- **API:** Provider calls **GET /v1/work-orders/:id** or **GET /v1/work-orders?provider=…&external_id=…** to read status, appointment date, completion result.  
- **Portal:** Provider staff log in → search by PO, RMA, or order number → view status, dates, and (if permitted) technician and completion notes.  
- **Webhooks (optional):** If the enhanced system pushes webhooks to the provider, their system receives events (e.g. work order created, assigned, completed) without polling.

**Provider care about:** Is the order received? Is it scheduled? Is it completed or cancelled? What was the result (repaired, NPF, unreachable, etc.) for claims and billing.

---

## 3. Back-Office / Operations Workflows

Back-office users (dispatchers, coordinators, billing) run the day-to-day operations inside your organization. Their work is centered on the SCT system and linked portals.

### 3.1 Daily Inbound and Triage

**Process:**

1. **Orders arrive** via API, batch, or EDI (no manual step) or are entered manually in the portal.  
2. **Back-office** opens the Report Center or work order list and sees new orders in status **Received** (or **Parts ordered** if parts were pre-ordered by provider).  
3. **Triage:** Filter by provider, date, zip, or status. Prioritize by requested date or SLA.  
4. **Data fixes:** If address or product info is wrong, edit in the system (or correct in the provider’s data for next time).

**Hisense-style daily list (from legacy):** Receive and edit CRM file (clear suggested date, assign date, part notes); receive EOD; update tracking in portal; run backlog; take UR report and escalate; respond to emails.

### 3.2 Parts and Tracking

**Process:**

1. **Order parts** (if not provided by OEM/warranty): use internal parts system or Service Bench (for NEW/extended warranty). Record part numbers and vendor (e.g. Service Bench = tail -1, ShopJimmy = tail -2).  
2. **Receive tracking:** When parts ship, provider or carrier sends tracking. Back-office **enters or uploads** tracking numbers (and return tracking for cores) in the work order.  
3. **Status update:** System moves WO to **Parts shipped** and, for OSR, can flag **Need to schedule** when parts have landed.  
4. **Core return:** Track return tracking and waybill; use open-cores report; send reminders (e.g. 14–21 day) for cores not yet returned.

**User actions:** In SCT system or portal: open WO → Parts section → add/edit tracking, return tracking, ship date. Optionally run “parts not shipped” or “open cores” reports.

### 3.3 Scheduling and Appointment

**Process:**

1. **Confirm EU availability** (phone, IVR, or email): get a preferred date/time window.  
2. **Set confirmed appointment** in the system (date and time).  
3. **Sync:** System sends appointment to the field platform (OnForce, WorkMarket); appointment date flow must succeed so techs and billing see the right date.  
4. **Reschedule:** If EU or tech reschedules, back-office (or tech via platform) updates appointment; system syncs again.

**User actions:** Open WO → set or change appointment date/time → save. Optionally use IVR or script to call EU first, then set in system.

**Business rule:** Requested date is “tentative”; only confirmed appointment is the binding slot. Communicate that clearly to EU to avoid “promise date” complaints (legacy notes).

### 3.4 Technician Assignment (Dispatch)

**Process:**

1. **Eligible WOs:** Orders in **Scheduling** or **Parts shipped** with a confirmed appointment (or at least requested window).  
2. **Routing rules:** System (or back-office) uses zip, radius, capacity, and talent pool (e.g. WWTS, OnForce, WorkMarket).  
3. **Push to platform:** Back-office (or system) pushes the job to the chosen field platform; platform returns a job id.  
4. **Tech accepts:** Technician accepts in the platform; platform sends status back; system updates WO to **Assigned** and records tech and accept date.  
5. **Fallback:** If no accept in time, reassign or expand radius (e.g. WorkMarket 60 miles, then expand); or assign to a different pool.

**User actions:** In SCT system: select WO(s) → “Assign to field” → choose platform and (if needed) pool/radius → confirm. Or use Report Center “Tech Assign” view to bulk assign. In legacy, “technician assign choose WWTS” then “approve today’s” in portal.

**Rules (from legacy):** Zip codes and job flow are defined in “SCT Portal & Onforce System Outline & Rules.” WWTS (or platform) must not close WOs with a status that breaks SCT TAT and billing (e.g. FIXED-only close that doesn’t match your completion logic).

### 3.5 Completion and Closure

**Process:**

1. **Tech completes** in the field platform: enters result (success, NPF, defective panel, unreachable, etc.), parts used, return tracking, unit condition, and any photos/signature.  
2. **Platform sends** completion (webhook or polled); system receives it and maps to canonical completion payload.  
3. **System updates** WO to **Completed** and stores completion details.  
4. **Back-office** (or automated rules): apply billing logic (DIAG vs repair, deductions); submit or sync claims to provider (NEW, OEM); handle rejections (time limits, reason codes).  
5. **Close WO:** Set status to **Closed**; no further changes. Optionally run Claims Pull or billing export.

**User actions:** Most completion data comes from the tech via platform. Back-office may: correct or add notes; run “COM TAT” and “RET TAT” and “Part Return Status” reports (Report Center); resolve claim rejections; close the WO when billing/claims are done.

**2TR / second repair:** If the same unit needs a second repair (e.g. “solution in tech room”), back-office or system marks for escalation; status change so billing and provider are aligned.

### 3.6 Claims and Rejection Process

**Process:**

1. **Submit claim** to provider (OEM or extended warranty) per their rules and time limits.  
2. **Provider responds:** Approved (full or DIAG-only) or denied (e.g. unreachable, NPF, panel defect, duplicate).  
3. **Back-office** records outcome; disputes if needed (e.g. video proof for same-issue second visit).  
4. **Deductions:** System or report shows deductions (parts not shipped, carrier, schedule date, etc.); open WO KPI can score by deductions.  
5. **Phase act com (legacy):** Close with correct “closed request” and reason (defective/repair codes, STR reason); reject payment to WWTS when close-out was wrong.

**User actions:** In Report Center or billing UI: view WO → claim status → enter approval/denial and reason; run Claims Pull or Claim Historical report; fix any WWTS/portal close-out that broke TAT.

### 3.7 Report Center (Davao-Style)

**Process:**

Back-office uses Report Center daily for:

- **Tech Assign** – See WOs that need assignment; assign to platform/pool; see who is assigned.  
- **COM TAT** – Completion TAT (request or parts-received → completed).  
- **RET TAT** – Return TAT (e.g. core/parts return).  
- **Part Return Status** – Open cores; return tracking; reminders.  
- **Open WO by status** – Received, Parts shipped, Scheduling, Assigned, etc.  
- **Billing / claims** – Billing Matrix; Claims Pull; dispatch/claim reports; repair reports by client (e.g. TPV).

**User actions:** Log in to portal → open Report Center → pick report or dashboard → filter by date, provider, status → export CSV/Excel if needed.

### 3.8 No-Show and Cancellation

**Process:**

1. **No-show:** EU does not show for appointment. Back-office (or system) marks no-show; applies no-show pricing if applicable; may reschedule or cancel.  
2. **Cancellation:** EU or provider cancels. Back-office cancels WO in system; reason recorded; sync to field platform (void/cancel job) and to provider if needed.  
3. **Last Mile:** Cancellation wording and no-show pricing table are defined in process; system can support reason codes and pricing rules.

**User actions:** Open WO → Cancel or Mark no-show → select reason → save; system updates status and (if configured) notifies provider/platform.

---

## 4. Technician (Field) Workflows

Technicians use the **field platform** (OnForce, WorkMarket, or equivalent), not the SCT system directly. SCT sends the job to the platform; the platform is the tech’s “app.”

### 4.1 Receiving and Accepting a Job

**Process:**

1. **Platform shows** available jobs (by zip, radius, skills, or talent pool).  
2. **Tech** opens the job: sees address, product, problem, instructions, appointment window, and (if applicable) parts tracking.  
3. **Tech accepts** the job. Platform sends “accepted” to SCT; SCT records Date Accepted and assigns the WO to that tech.  
4. **Tech** may see a deep link or reference (e.g. SCT#, OSR#) for phone support.

**User actions:** In OnForce/WorkMarket app or web: browse or receive notification → open job → Accept.

### 4.2 Before the Appointment

**Process:**

1. **Tech** checks parts: confirm parts are at EU or at tech office; use tracking if needed.  
2. **Tech** may call EU to confirm time (e.g. “on my way” or confirm window).  
3. **Reschedule:** If tech or EU needs to move the appointment, tech (or back-office) updates in platform; platform syncs to SCT so appointment date flow is correct.

**User actions:** In platform: view job details and parts; optionally update appointment or status (e.g. “Need to schedule,” “Reschedule”).

### 4.3 On Site and Completion

**Process:**

1. **Tech** arrives at EU location; performs repair, installation, or delivery per service type.  
2. **Tech** documents in the platform:  
   - Result (e.g. “Fixed parts replaced,” “No problem found,” “Defective panel,” “EU unreachable”).  
   - Parts used (part numbers, qty).  
   - Return tracking for cores/old parts.  
   - Unit condition (before/after); optional photos.  
   - Model/serial verification; signature if required.  
3. **Tech** submits completion in the platform.  
4. **Platform** sends completion to SCT; SCT updates WO to **Completed** and stores the payload for billing and claims.

**User actions:** In platform: open job → Complete → fill required fields (result, parts, return tracking, condition) → submit.

**Business rule:** “Fixed parts replaced” and other completion triggers must flow to SCT so TAT and billing are correct. 2TR (second repair) cases: tech may set status to “escalating” or similar so back-office can handle.

### 4.4 Vacation or Unavailability

**Process (from legacy Master IT List):** “Tech Vacation button that holds PO for a certain time.”  
- **Tech** (or back-office) marks themselves unavailable in the platform or in SCT for a date range.  
- **System** does not assign new jobs to that tech during that period; existing POs/jobs may be held or reassigned per policy.

**User actions:** In platform or portal: set vacation/unavailable dates → save.

---

## 5. End Customer (EU) Workflows

The end customer is the homeowner or business where the service is performed. They interact mainly via **tracking**, **phone/IVR**, and **communication**, not the SCT system UI.

### 5.1 Requesting Service

**Process:**

- **In-warranty / extended warranty:** EU calls OEM or warranty company; that provider creates the work order (via API, portal, or batch) and may give EU a reference number.  
- **Customer pay:** EU submits request via provider’s site or phone; provider creates WO (and may collect payment).  
- **EU** may receive an initial email or SMS with order number and “what to expect.”

**User actions (EU):** Call or go online to provider → provide address, product, problem → receive confirmation and (optionally) order number.

### 5.2 Scheduling and Confirmation

**Process:**

1. **Intro / IVR:** SCT or provider calls EU (or automated IVR) to confirm availability and get a preferred date/time window.  
2. **Back-office** (or system) sets the **confirmed appointment** in SCT; EU may get a confirmation (email/SMS).  
3. **Day-of:** Optional “on my way” text or call from tech or system.  
4. **Reschedule:** EU calls to reschedule; back-office or IVR captures new window; appointment updated in system and synced to field platform.

**User actions (EU):** Answer call or IVR; choose date/time; receive confirmation; optionally receive reminder or “on my way” message.

### 5.3 Tracking Order Status (Last Mile / Delivery)

**Process (e.g. VIZIO Last Mile):**

1. **EU** receives a link (e.g. customer tracking page: order # and status).  
2. **EU** opens link and sees status: e.g. Order received → Scheduled → Out for delivery → Delivered (and optionally installer name and ETA).  
3. **Data source:** SCT (or enhanced system) feeds status to the tracking page from WO status and (if applicable) platform updates.

**User actions (EU):** Open tracking link → view status and (if shown) appointment or delivery window.

### 5.4 Day of Service

**Process:**

1. **EU** is present at confirmed time; lets tech in; provides access to product.  
2. **Tech** performs repair/install/delivery; may ask EU to sign or confirm.  
3. **No-show by EU:** If EU is not there, tech (or back-office) marks no-show; EU may be contacted to reschedule; no-show pricing may apply per contract.

**User actions (EU):** Be available; allow access; sign or confirm if asked.

### 5.5 Post-Service

**Process:**

- **EU** may get a follow-up call or survey (“Thank you for the opportunity to service your [brand] TV”).  
- **Complaints or defects:** EU calls provider or SCT support; back-office may create a follow-up WO (e.g. 2TR) or handle per provider rules.

**User actions (EU):** Answer follow-up; call support if issue persists.

---

## 6. Cross-Cutting Processes (By Service Type)

### 6.1 OSR (On-Site Repair) End-to-End

| Step | Provider | Back-office | Technician | EU |
|------|----------|-------------|------------|-----|
| 1. Create WO | Submit via API/portal/batch/EDI | — | — | Requested service from provider |
| 2. Parts | — | Order parts; enter tracking; core tail (-1, -2) | — | — |
| 3. Schedule | — | Confirm EU (IVR/call); set appointment; sync to platform | — | Confirm date/time |
| 4. Assign | — | Push to platform; routing by zip/pool | Accept job in platform | — |
| 5. Complete | — | — | On site; document result, parts, return; submit in platform | Present; allow repair |
| 6. Close | — | Billing/claims; close WO; Report Center | — | Optional follow-up |
| 7. Cancel/no-show | May cancel | Cancel or no-show in system; sync platform | — | No-show or request cancel |

### 6.2 OSS / Last Mile End-to-End

| Step | Provider | Back-office | Technician / driver | EU |
|------|----------|-------------|----------------------|-----|
| 1. Order/ASN | Send order or ASN (e.g. shiptype UN) | — | — | — |
| 2. Confirm EU | — | Confirm availability (IVR/call); set appointment | — | Confirm date/time |
| 3. Terminal | — | Dispatch to warehouse/terminal; confirm OSS# | — | — |
| 4. Inspect at terminal | — | — | Inspect/document unit; flashlight check; load | — |
| 5. Deliver | — | — | Deliver to EU home; inspect old unit/SN; pack; power on new; get signature; load old; return to terminal | Present; sign |
| 6. Track | — | Report Center; TAT | — | Use tracking page |
| 7. Cancel/no-show | — | Apply cancellation/no-show process | — | — |

### 6.3 Installation or Inspection Only

- **Installation:** Provider creates WO → back-office schedules and assigns → tech performs install (checklist) → completes in platform → back-office closes.  
- **Inspection:** Same flow; tech documents condition (photos, notes); no repair or parts.

---

## 7. Summary: Who Does What

| End user | Main workflows |
|----------|----------------|
| **Provider staff** | Submit WOs (API/portal/batch/EDI); track status and completion (API/portal/webhooks). |
| **Back-office** | Triage inbound; manage parts and tracking; schedule and set appointment; assign techs (push to platform); run Report Center (Tech Assign, COM/RET TAT, Part Return); handle completion data, billing, claims, rejections; cancel and no-show. |
| **Technicians** | Accept jobs in platform; confirm or reschedule appointment; perform work; document result, parts, return tracking, condition; submit completion in platform. |
| **End customer** | Request service from provider; confirm appointment (call/IVR); track order (tracking page); be present and sign; optional follow-up. |
| **Admin** | Configure providers, service types, routing rules, and integrations (in enhanced system). |

---

*This document describes end-user workflows and processes for the SCT system and its enhanced variant. For system design and build scope, see the design scope documents in this folder. For which roles are AI-led vs human-only, see [SCT_AI_and_Human_Operating_Model.md](./SCT_AI_and_Human_Operating_Model.md).*
