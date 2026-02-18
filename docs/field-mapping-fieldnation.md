# Field Nation ↔ TGND Canonical Field Mapping

**Source:** [Field Nation Work Order Object](https://developer.fieldnation.com/client-api/restapi/components/workorder_object/), [Locations](https://developer.fieldnation.com/client-api/restapi/components/wo_locations/), [Schedules](https://developer.fieldnation.com/client-api/restapi/components/schedules/), [Status](https://developer.fieldnation.com/client-api/restapi/components/status_object/), [Webhooks](https://developer.fieldnation.com/client-api/webhooks/howitworks/).

---

## TGND canonical → Field Nation (outbound: create/update work order)

| TGND canonical field | Field Nation parameter | Notes |
|----------------------|-------------------------|--------|
| id | (not sent; FN returns own id) | Store FN work order id as platform_job_id in TGND. |
| problem / instructions | title | FN: "Overview Title". Required for create. Use problem or first line of instructions. |
| instructions | description.html | FN: "Description Public Info". Standard text or HTML. |
| ship_to.name | location.display_name | Custom location: "Location name". |
| ship_to.address_line1 | location.address1 | Custom location. |
| ship_to.address_line2 | location.address2 | Optional. |
| ship_to.city | location.city | |
| ship_to.state | location.state | |
| ship_to.zip | location.zip | |
| ship_to.phone | (contacts or location contact) | FN uses separate contacts object; can add to location notes or contacts. |
| appointment_date | schedule.service_window | Map to FN schedule. See below. |
| requested_date_start / requested_date_end | schedule.service_window.start / end | For "between" or "hours" mode. |
| product (brand, model, serial) | description.html or custom_fields | Embed in description or use FN custom fields. |
| service_type | types_of_work / service_types_new | FN uses work type id + service type id; map TGND service_type to FN type ids (call Get Work Types / Get Service Types). |
| pricing | pay | FN has separate Pay object; map labor/parts to FN pay structure. |

### Schedule mapping (TGND → Field Nation)

- **Single appointment_date (TGND):** Use FN `schedule.service_window.mode: "exact"`, `start.utc`: appointment_date in UTC format `YYYY-MM-DD HH:MM:SS`.
- **Date range (requested_date_start, requested_date_end):** Use `mode: "between"`, `start.utc` and `end.utc` in same format.
- **Schedule note:** Optional; use TGND instructions or leave empty.

### Location mapping (TGND → Field Nation)

- Use **custom** location when TGND has ship_to: `mode: "custom"`, `display_name`, `address1`, `address2`, `city`, `state`, `zip`, `country` (default "US").

---

## Field Nation → TGND (inbound: webhooks)

Field Nation sends the **full Work Order Object** in webhook payloads plus event/status-specific params. Map back to TGND for status sync and completion.

| Field Nation (work order / status) | TGND canonical | Notes |
|------------------------------------|-----------------|--------|
| id | platform_job_id | Store on TGND WO when pushing to FN. |
| status.name (Draft, Published, Assigned, Work Done, Approved, Paid, Cancelled, etc.) | status | Map FN status to TGND lifecycle. See status map below. |
| title | problem (or keep in metadata) | |
| location (address1, city, state, zip, etc.) | ship_to | |
| schedule.service_window.start.utc / end.utc | appointment_date / requested_date_* | |
| description.html | instructions | |
| event (workorder.created, task.completed, etc.) | — | Use to trigger TGND updates (e.g. task completed → consider in_progress or completed). |

### Field Nation status → TGND status (webhook sync)

| Field Nation status.name | TGND status |
|--------------------------|-------------|
| Draft | (WO not yet published; TGND may keep scheduling) |
| Published / Routed | scheduling |
| Assigned, Assigned: Checked in, Confirmed, Provider on the Way, Provider Checked In | assigned / in_progress |
| Provider Checked Out, Work Done | completed |
| Approved, Paid | completed (or closed when TGND closes after billing) |
| Cancelled, Deleted, Postponed (On Hold), Provider Removed Assignment | cancelled |

Refer to [Field Nation Webhooks – Status Changes](https://developer.fieldnation.com/client-api/webhooks/statuses/) for full list. When FN sends status change, look up TGND WO by platform_job_id and PATCH status accordingly.

---

## Field Nation webhook events (subscribe for TGND)

- **workorder.created** – WO created on FN (if created there).
- **workorder.routed** – Mapped to TGND scheduling.
- **Task Completed** – May indicate progress; map to in_progress or completed per workflow.
- **Provider Checked In** – assigned / in_progress.
- **Provider Checked Out** / **Work Done** – completed.
- **Schedule Updated** – Update TGND appointment_date if needed.
- **Work Order Declined** – May need to reassign; keep TGND in scheduling.

Register TGND endpoint (e.g. POST /webhooks/field/fieldnation) with [Create Webhook](https://developer.fieldnation.com/client-api/webhooks/webhooks_create/). Verify signature using `secret` per [Securing Webhooks](https://developer.fieldnation.com/client-api/webhooks/secure).
