# SCT Design Scope: System, Portal, and App

**Document purpose:** A complete design scope for the Service Center Team (SCT) system, portal, and app, derived from file and content review of the `SCT/`, `Notes_Search_Results/`, and related Sample Work directories.  
**Basis:** Career_Application_System/00_Source_Materials/Sample Work from Various Roles (SCT folder, Notes_Search_Results, Resume_Experience_Jobs_Roles_High_Value.md, Davao_Notes, OSS/OF/Last Mile/claim/rejection notes, FTP samples, login/process docs).  
**Quality:** Evidence-based; each section ties to specific source files where applicable.

---

## 1. Executive Summary and Context

### 1.1 What SCT Is

SCT (Service Center Team) operated as a **national on-demand labor and field service company** for consumer electronics: onsite repair (OSR), installation, Last Mile delivery, and reverse logistics. It served multiple clients (VIZIO, Hisense, Sharp, JVC, Funai, NEW/Asurion, Presidio, OEMs such as TPV, Wistron, Amtran, Foxconn) and later transitioned into UNIS (Unified Network Information Systems). The **SCT system** is the internal platform that:

- Creates and tracks work orders (OSR, OSS, Last Mile)
- Assigns jobs to technicians by zip/geography and capacity
- Manages parts (orders, tracking, cores, returns)
- Integrates with vendor/client portals, FTP, EDI, and field-dispatch tools (OnForce, WorkMarket, Service Bench)
- Supports billing, claims, rejection logic, and reporting (Report Center, TAT, KPIs)

The **SCT portal** refers to web interfaces used by clients (e.g., VIZIO), vendors (OEMs), and internal back-office (Davao) for tracking, claims, and reporting. The **app** context in the materials is largely **technician-facing** (OnForce, WorkMarket, Service Bench) and **customer-facing tracking** (VIZIO Last Mile tracking page); there is no standalone "SCT mobile app" described—rather, integrations with third-party labor and portal UIs.

### 1.2 Key Source Evidence

| Area | Primary sources |
|------|------------------|
| Portal logins, FTP, integrations | SCT/Desktop Dumps/20180716/All Account Login Information.txt; SCT/Master IT List 10.24.2016.txt |
| OSS workflow | Notes_Search_Results/OSS Notes 3.10.2016.txt |
| OnForce triggers, appointment flow | Notes_Search_Results/Notes for OF 1.26.2016 3.txt |
| Last Mile, WMS/TMS, EDI | Notes_Search_Results/7.13.2017 - Meeting Agenda and Notes.txt; Business Review Notes 2.19.2018.txt |
| Davao, Report Center, portal access | Notes_Search_Results/Davao_Notes.txt |
| Claims, rejection, NEW, phase act com | SCT/Other/Claim Reject Project/Notes for rejection process.txt; Resume_Experience_Jobs_Roles_High_Value.md |
| Part tracking, SCT# tail | SCT/Other/Core Wait/2015/Notes to improve part tracking.txt |
| Hisense/VIZIO process, portal | SCT/Other/Hisense (notes on hisense process 2.23.txt; Hisense Steps.txt; notes from weekly hisesne call 2.25.2015) |
| FTP data shapes | SCT/FTP Files/SCT4IN_*.csv; SCT/FTP Files/SCTPO_EDTech_*.csv; SCT/Final Proposal/OF_Export_YTD.csv |

---

## 2. SCT System (Core Platform)

### 2.1 System Role

The SCT system is the **central operational system** that:

- **Creates work orders** from client/OEM inputs (ASN, CRM files, EDI, FTP manifests)
- **Assigns work to technicians** by zip code, capacity, and talent pool (e.g., WWTS, OnForce, WorkMarket)
- **Tracks parts and cores** (order, ship, return, RAWB, waybill, open cores)
- **Drives status and billing** (appointment date, completion, deductions, claims)
- **Feeds and receives data** from portals, FTP, EDI, and field-management tools

### 2.2 Core Entities and Identifiers

- **SCT number (CF-RMA / RMA#):** Primary work order identifier (e.g. SCT276589, SCT093749).  
  - **Tail convention** for parts/vendors: e.g. `-1` = Service Bench, `-2` = ShopJimmy (see Notes to improve part tracking.txt).
- **OSR number:** On-Site Repair work order ID (e.g. OSR2965820, OSR2984915); links to SCT# and client/OEM.
- **OSS number:** On-Site Service (e.g. Last Mile) identifier; confirmed at warehouse/terminal before delivery.
- **PO / RMA#:** Purchase order and RMA used in FTP and portal flows (e.g. AV20171030019, ED20180608001).

### 2.3 Work Order Lifecycle (OSR / OSR-like)

Inferred from OF notes and OSS docs:

1. **Order creation** – From client (VIZIO, Hisense, NEW, etc.) or from ASN/manifest (Last Mile: shiptype "UN" intended to create Last Mile work in SCT; Business Review noted mismatch with "Division Description" on ASN).
2. **Parts** – Parts ordered/shipped; tracking uploaded; optional tail for vendor (SB, ShopJimmy).
3. **Appointment** – Confirm EU availability; set confirmed appointment date (critical for OnForce flow and billing).
4. **Dispatch** – Route to technician pool (WWTS, OnForce, WorkMarket); zip/capacity rules.
5. **Tech acceptance** – Tech accepts; dates (Date First Routed, Date Accepted) recorded.
6. **Completion** – Tech completes; repair/result documented (e.g. "Fixed parts replaced," unit condition, parts used).
7. **Closure and billing** – Status closed; billing/claims (DIAG vs repair, deductions); core/parts return tracking.

### 2.4 Business Rules and Triggers (from OnForce / "OF" notes)

- **Appointment date flow** – When appointment date is set/changed, downstream systems (e.g. OnForce) must receive update; failures documented (e.g. OSR1629649, OSR1629932 "no flow").
- **PDF / "Work PDF" trigger** – Completion documentation triggers (e.g. "Fixed parts replaced") must flow so billing and TAT are correct.
- **"Need to schedule"** – When parts received but still in "accepted" or "need to reorder," status should move to schedule-needed; many examples of "stuck" WOs.
- **48-hour need** – Escalation when tech has questions or process must restart (e.g. SCT154762).
- **2TR (second repair)** – Status change to "escalating" when solution is in "tech room."
- **Human intervention** – Cases where status did not auto-update (e.g. failed box select, external factor, status priority).
- **WWTS integration** – WWTS must not close WOs with status "FIXED" in a way that breaks SCT TAT and billing (rejection process notes).

### 2.5 Part and Core Management

- **Order and ship** – Parts ordered (often Buyer-supplied); tracking numbers (outbound and return) stored.
- **SCT# tail** – Distinguishes part source/destination: e.g. -1 = Service Bench, -2 = ShopJimmy.
- **Core return** – RAWB send/response; waybill cleanup (SCT and WWTS vs waybill report); open cores master; 14–21 day reminder for return.
- **Phase act com (system improvement)** – Closed request, defective/repair codes, STR (Ship-to-Repair or similar) reason dropdown; core/order entry (no core required, tracking, reminders).

### 2.6 KPI and Reporting (Excel and System)

- **Open work order KPI** – Excel-based; scored by deductions (e.g. parts not shipped, carrier, schedule date) (Oracle interview notes; Resume high-value).
- **Report Center (Davao)** – Desired capability "like WWTS": Tech Assign, COM TAT, RET TAT, Part Return Status (Davao_Notes).
- **Other reports** – Billing Matrix; Claim Historical Data Consolidated; Claims Pull (monthly); Viz TAT; SCT Reports; dispatch/claim reports; repair reports (TPV, etc.).

### 2.7 Master IT List (Explicit Backlog)

From Master IT List 10.24.2016.txt:

1. Problem Code to Template  
2. Tech Vacation button that holds PO for a certain time  
3. Performance Reports  

---

## 3. SCT Portal

### 3.1 Portal Types and Users

| Portal | Purpose | Users | Evidence |
|--------|--------|--------|----------|
| **SCT Portal (client logins)** | Order/work visibility, tracking, possibly claims | VIZIO (VizioUser, VizioTPV, VizioAaron, VizioAmtran, VIZIOZYLUX, VIZIOWISTRON, VIZIOONKYO, VIZIOFoxconn), OEMs | All Account Login Information.txt |
| **VIZIO Last Mile customer tracking** | Customers track Last Mile orders | End customers (EU) | Business Review Notes 2.19.2018: "Portal for Customers to track orders" – non-test link `http://onsite.servicecenterteam.com/kendoui/VizioTracking.html` (noted wrong domain) |
| **TWG / ServiceApp** | Vendor portal (e.g. NEW, authorizations) | Internal/vendor | Work_Market_Discussion_053118.txt: portal.serviceapp.com, TWGuser |
| **Service Bench** | Parts, authorization, claims (NEW) | Back-office (e.g. Davao Star); Gio, AJ | Davao_Notes; NEW Asurion concerns; All Account Login – Service Bench (Star) SER00139 |
| **Onforce** | Technician dispatch and work orders | Technicians; back-office for updates | Davao_Notes: "Portal Access > all agents wants access to NEW Service Bench & Onforce for updates"; OF_Export_YTD |
| **WWTS** | Technician assignment and work flow | Internal (tech assign, approve); integration with SCT | Hisense process (technician assign choose WWTS); rejection process (WWTS close-out vs FIXED status) |

### 3.2 SCT Portal Login (Client/OEM)

- **Logins:** VizioUser, VizioTPV, VizioAaron, VizioAmtran, VIZIOZYLUX, VIZIOWISTRON, VIZIOONKYO, VIZIOFoxconn (with distinct passwords).
- **Role:** Visibility into orders/work tied to their brand/OEM; likely order status, tracking, and reporting.

### 3.3 VIZIO Last Mile Tracking (Customer-Facing)

- **URL (legacy):** `http://onsite.servicecenterteam.com/kendoui/VizioTracking.html` (non-test link; domain noted as wrong).
- **Purpose:** Let end customers track Last Mile delivery/installation orders.
- **Data:** Likely order #, status, appointment window; depends on ASN/manifest data. Business Review: shiptype "UN" should flag ASNs to create Last Mile work in SCT; "Division Description" on ASN did not match "UN," causing integration issues.

### 3.4 Davao and Back-Office Portal Access

- **Report Center (desired):** Tech Assign, COM TAT, RET TAT, Part Return Status – "like WWTS."
- **Portal access:** All agents to have access to NEW Service Bench and Onforce for updates (Davao_Notes).
- **Billing:** Star (billing for SCT, VIZIO, ST, NEW, JVC, Sharp); Report Center; COM TAT, RET TAT; tech assign; part return & reconciliation.

### 3.5 SCT Portal & Onforce System Outline (Process)

- Davao_Notes: "*SCT Portal & Onforce System Outline & Rules > how the jobs flow & zip codes are assigned*."  
- Design scope should include: **job flow** (from order creation to dispatch to completion) and **zip code assignment rules** (routing, capacity, talent pools).

---

## 4. SCT "App" (Technician and Customer-Facing Touchpoints)

### 4.1 No Dedicated "SCT App" in Materials

There is **no reference to a standalone SCT-branded mobile app**. Technician and customer experience is delivered through:

- **OnForce** – Technician work orders, acceptance, completion, custom fields (CF-*), repair details.
- **WorkMarket** – Talent pools, routing rules (e.g. 60 miles zip, expand radius), templates, custom fields; voiding tickets; notifying techs of unit inspections (Work_Market_Discussion_053118.txt).
- **Service Bench** – Parts ordering, authorization, shipping address (e.g. correct ship-to vs Walnut, CA), back-order/cancel notifications (NEW Asurion concerns).
- **WWTS** – Technician assign, approve; must align close-out status with SCT (no FIXED-only close that breaks TAT/billing).

### 4.2 Technician Flow (App-Like Experience via OnForce/WorkMarket)

- Receive and accept work orders (by zip, capacity, talent pool).
- View appointment window, parts, tracking, instructions.
- Update appointment date (must flow back to SCT/OF).
- Complete job: document unit condition, parts used, success/failure, return tracking; "Fixed parts replaced" and PDF trigger drive billing.
- 2TR / "solution in tech room" → escalate status.

### 4.3 Customer-Facing "App" (Tracking)

- **VIZIO Last Mile:** Customer tracking page (VizioTracking.html) for order/appointment status.
- **IVR / intro call:** Confirm EU availability and schedule window (Last Mile Business Review); optional "on my way" text/email/call.

### 4.4 Ideas for SCT (From ideas for SCT.txt)

- Angies list sourcing  
- Recruiting from Guru.com  

(These are recruiting/sourcing ideas, not app features, but indicate future expansion of labor sourcing.)

---

## 5. Integrations and Data Flows

### 5.1 FTP

- **Inbound:**  
  - **SCT4IN_*.csv** – Order/PO data (Date Ordered, PO, RMA#, Model, Serial, Problem, Instruction, Ship-to, OSR Creation Date, Tracking#, Status, ShippingDate, ReturnTracking#, Brand, etc.).  
  - **SCTPO_EDTech_*.csv** – EDTech/VIZIO OSR-style data (Date Ordered, PO, RMA#, RMANumber, Tracking#, Status, ODM, Model, Serial, Problem, Ship-to, Tech Phone, PartsShipto, EDTech Notes).  
  - **VizioMasterReceiving** (UNIS 2020) – Master receiving for VIZIO.  
  - OEM-specific: Foxconn, Wistron, TPV, Amtran, PDC, HDT – each with Inbound/Outbound folder pairs (All Account Login Information).

- **Outbound:**  
  - SCT sends to OEM/client folders (e.g. SCT_To_Foxconn/INBOX, SCT_To_Wistron/Inbox, SCT_To_TPV/INBOX, SCT-to-Amtran/DailyShipping, etc.).

- **Other FTP:**  
  - Avatek FTP (64.27.29.4, AvatekSCT); Vizio production FTP (production.ftp.vinc.com, port 9200, SCT/dewey9ke); ReportUser (64.27.29.4).

### 5.2 EDI

- **Last Mile:** EDI receiving; terminals; WMS (inventory deduction, consignment); TMS (BOL/MBOL, PRO#); 90+ terminals/cross-docks; need for no carrier transit status gaps (7.13.2017 Meeting; Business Review).
- **ASN:** Shiptype "UN" to create Last Mile work in SCT; "Division Description" must align with "UN" (Business Review).

### 5.3 Portals (Summary)

- **TWG/ServiceApp** – portal.serviceapp.com (vendor/authorization).  
- **WorkMarket** – Routing rules, talent pools, templates, API (substatus in developer portal).  
- **Service Bench** – NEW/Asurion parts, authorization, shipping location.  
- **Onforce** – WO lifecycle, custom fields, billing export (OF_Export_YTD).  
- **WWTS** – Tech assign, approve; status close-out must align with SCT.

### 5.4 Other Integrations

- **Ring Central** – Inbound/outbound numbers; IVR (e.g. CE Ext Warranty creation → IVR to customer; Davao).  
- **Email/CRM** – Hisense CRM file transfer; EOD file; tracking upload; "inbox" under Hisense to SCT FTP folder.  
- **IVR** – Intro call for Last Mile; 5a addition for CE Ext War (Davao).

---

## 6. Key Business Processes (Design Implications)

### 6.1 OSR (On-Site Repair)

- **Inputs:** Client/OEM (VIZIO, TPV, etc.) or NEW; PO, RMA, model, serial, problem, ship-to (EU or tech office).  
- **Steps:** Create SCT#/OSR#; order parts (tail for vendor); upload tracking; assign tech (WWTS/OnForce/WorkMarket); set appointment; tech accepts → completes → documents; core/parts return; close and bill.  
- **System:** SCT system holds master WO; OnForce/WorkMarket hold dispatch copy; triggers (appointment, PDF, "Need to schedule," 2TR) must flow.

### 6.2 OSS (On-Site Service) / Last Mile

- **Steps (OSS Notes 3.10.2016):** (1) Upon tracking upload confirm EU availability, (2) Set confirmed appointment, (3) Dispatch to local warehouse/terminal, (4) Confirm OSS#, (5) Inspect/document unit, (6) Flashlight check panel, (7) Load safely, (8) Deliver to EU home, (9) Inspect old unit/SN, (10) Pack old unit, (11) Pack stand separately, (12) Power on new unit, document & signature, (13) Load old units, (14) Return to terminal/warehouse.  
- **Last Mile:** Manifest (e.g. "Mana") possibly via FTP; EDI; UNIS/VIZIO escalation email and UR line; cancellation and no-show process/pricing (Last_Mile_Meeting12.29.2017; Business Review).

### 6.3 Claims and Rejection Process

- **Submittal time limits** – Time triggers; correct submittal paid.  
- **Reasons:** EU unreachable, intermittent, NPF, panel defect, SCT error (e.g. need video proof for same issue/repair), WWTS close-out as FIXED (breaks TAT/billing).  
- **NEW:** DIAG $15 approved, repair $274 denied in example; duplicate WO and restock twice when EU unreachable; restocking fee; panel defect handling.  
- **Phase act com:** Closed request, defective/repair codes, STR reason; reject payment to WWTS.

### 6.4 Hisense-Specific (Portal and Process)

- **Daily list:** Receive/edit CRM file (clear suggested date, assign date, part notes); receive EOD; update tracking in portal; run backlog; UR report → escalate to Vince; respond to emails.  
- **Portal:** Upload modified CRM to "inbox" (Hisense to SCT FTP); tracking and return tracking; technician assign (WWTS); approve today's.  
- **-2 file:** Second repair; creation date; original RMA; delete except "monica"; add -2 to serial; contact Hisense for more parts; CRM-2; close as unsuccessful repair with notes; STR handling.

### 6.5 No-Show and Cancellation

- Last Mile: cancellation wording; no-show pricing table and process (Last_Mile_Meeting; Business Review).  
- Davao: "No Show Process" listed as process required.

---

## 7. Data Model (Summary from FTP and OF Export)

### 7.1 Work Order (OF Export / OSR)

- **Identifiers:** CF-RMA Number (SCT#), Work Order ID (OnForce), OSR# in narrative.  
- **Dates:** Service Date Start/End, Appointment Date, Date Created, Date First Routed, Date Accepted, Date Completed, Date Paid, Date Cancelled.  
- **Financial:** Pricing Method, Spend Limit, Labor Total, Parts Total, Access Fee, etc.  
- **Parts:** CF-PartsNumber01–03, CF-PartsShipDate01–03, CF-PartsTrackingNumber01–03, CF-ReturnTracking01–03.  
- **Completion:** CF-* (unit functionality, condition, parts used, result, successful, model/serial/AWB verification, etc.).

### 7.2 SCT4IN / SCTPO_EDTech (FTP)

- Order date, PO, RMA#, Model, Serial, Problem, Instruction, Ship-to (name, address, city, state, zip), Tech Phone, Notes, OSR Creation Date, Tracking#, Status, ShippingDate, ReturnTracking#, ReturnShipDate, Brand, ODM, PartsShipto, EDTech Notes.

### 7.3 Part Tracking and Cores

- SCT# with tail (-1, -2) for vendor; waybill; RAWB; open cores; 14–21 day return reminder.

---

## 8. Gaps and Improvement Areas (Inferred from Notes)

1. **Last Mile in SCT:** ASN "Division Description" does not match "UN" for creating Last Mile work; align shiptype/division with SCT logic.  
2. **VIZIO tracking portal:** Fix domain and ensure correct, secure customer tracking (VizioTracking.html).  
3. **OnForce triggers:** Many "no flow" cases for appointment date and status; robust sync and retry.  
4. **Report Center:** Implement "like WWTS" – Tech Assign, COM TAT, RET TAT, Part Return Status.  
5. **NEW/Service Bench:** Back-order and cancel notifications to SCT; correct default shipping location when Service Bench orders parts; tech line awareness of part number process.  
6. **WWTS:** Prevent closing WO as FIXED in a way that breaks SCT TAT and billing.  
7. **Master IT List:** Problem Code to Template; Tech Vacation (hold PO); Performance Reports.  
8. **IVR and communication:** Consistent intro call, "on my way," and CE Ext Warranty IVR (Davao).  
9. **No-show and cancellation:** Clear process and pricing table; system support where applicable.

---

## 9. Out of Scope / Assumptions

- **Acquisition (SCT → UNIS):** Design scope describes SCT as used during the SCT era; UNIS may have evolved branding and systems.  
- **Actual codebase or DB schema:** Not present in reviewed files; data model inferred from CSV and notes.  
- **Security and compliance:** Not specified; design scope assumes portal/FTP/EDI security and access control to be defined separately.  
- **Native mobile app:** Not in scope; "app" is interpreted as technician and customer touchpoints via OnForce, WorkMarket, Service Bench, and VIZIO tracking page.

---

## 10. Design Scope Summary Table

| Layer | Components | Key functions |
|-------|------------|----------------|
| **SCT System** | WO lifecycle, SCT#/OSR#/OSS#, parts/cores, routing (zip, capacity), triggers (appointment, PDF, Need to schedule, 2TR), KPI/open WO scoring, Report Center (Tech Assign, COM/RET TAT, Part Return), billing/claims | Central source of truth; integrates to portals and field tools |
| **SCT Portal** | Client/OEM logins (VIZIO, OEMs), VIZIO Last Mile customer tracking (VizioTracking), Davao Report Center, Service Bench, Onforce, WWTS, TWG/ServiceApp | Visibility, tracking, claims, tech assign, updates |
| **SCT "App"** | OnForce, WorkMarket, Service Bench (tech); VIZIO tracking + IVR (customer) | Dispatch, accept, complete, document; customer track and communicate |

---

*End of SCT Design Scope. For file-level references, see §1.2 and the paths cited in each section. For the recreation project and AI/human split, see [SCT_AI_and_Human_Operating_Model.md](./SCT_AI_and_Human_Operating_Model.md) in this folder.*
