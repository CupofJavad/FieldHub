# Field Nation Webhook Handler Spec

**Purpose:** Define how TGND should handle incoming webhooks from Field Nation so WO status stays in sync.  
**Source:** [Field Nation Webhooks – How it Works](https://developer.fieldnation.com/client-api/webhooks/howitworks/), [Webhooks Object](https://developer.fieldnation.com/client-api/webhooks/webhooks_object/), [Securing Webhooks](https://developer.fieldnation.com/client-api/webhooks/secure).

---

## Endpoint

- **TGND route:** `POST /webhooks/field/fieldnation`
- **Register this URL** with Field Nation via [Create Webhook](https://developer.fieldnation.com/client-api/webhooks/webhooks_create/). Subscribe to events and status changes needed for TGND (e.g. workorder.created, workorder.routed, Provider Checked In, Provider Checked Out, Work Done, Schedule Updated, Cancelled).

---

## Request from Field Nation

- **Method:** POST  
- **Body:** Full [Work Order Object](https://developer.fieldnation.com/client-api/restapi/components/workorder_object/) plus event/status-specific params (e.g. `event`, `params`).  
- **Signature:** If you set a `secret` when creating the webhook, Field Nation signs the request. Verify the signature per [Securing Webhooks](https://developer.fieldnation.com/client-api/webhooks/secure) before trusting the payload.

---

## Handler logic

1. **Verify signature** (if secret is configured) using the webhook secret (store in env, e.g. `FIELD_NATION_WEBHOOK_SECRET`).
2. **Parse body:** Extract work order `id` (Field Nation work order id = TGND `platform_job_id`) and `status` (e.g. `status.name` or `status.display`).
3. **Look up TGND WO:** Find the work order where `platform_job_id = id` and `platform_type = 'fieldnation'`.
4. **Map status:** Use `fieldNationStatusToTgnd(status.name)` from `@tgnd/outbound-adapters` (see `docs/field-mapping-fieldnation.md`) to get TGND status.
5. **Update WO:** PATCH the TGND work order (e.g. `PATCH /v1/work-orders/:id` or internal update) with `status` and optionally `metadata.fn_last_event`, `metadata.fn_updated_at`. If status is `completed`, optionally store completion payload (e.g. closing_notes, time_logs) in metadata or a completion table.
6. **Respond:** Return HTTP 2xx quickly (e.g. 200). If you return non-2xx, Field Nation may retry (see Error Handling in their docs).

---

## Events / statuses to handle

| Event / status change | TGND action |
|------------------------|-------------|
| workorder.created      | Optional: ensure WO exists in TGND or ignore if WO was created by TGND. |
| workorder.routed       | Set TGND status to `scheduling` if not already assigned. |
| Provider Checked In    | Set TGND status to `in_progress`. |
| Provider Checked Out / Work Done | Set TGND status to `completed`; store completion payload. |
| Schedule Updated      | Update TGND `appointment_date` from FN schedule. |
| Cancelled / Deleted    | Set TGND status to `cancelled`. |

---

## Implementation

- Implement the route in `apps/api` (e.g. `routes/webhooks-fieldnation.js`). Use `@tgnd/outbound-adapters` `fieldNationStatusToTgnd` for mapping. Use `packages/logger` for logging. Look up WO by `platform_job_id` in DB and call existing update logic (e.g. same as PATCH work-orders).
