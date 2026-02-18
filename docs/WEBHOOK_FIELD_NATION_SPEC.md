# Field Nation completion webhook – TGND

**Purpose:** Contract for Field Nation (or a test client) to notify TGND when a job’s status changes (e.g. Work Done → WO completed).

---

## Endpoint

**POST** `/webhooks/field/fieldnation`

- **Content-Type:** `application/json`
- **Auth:** None for now; in production use signature verification per [Field Nation Webhooks](https://developer.fieldnation.com/client-api/webhooks/howitworks/).

---

## Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform_job_id` | string | Yes* | TGND-stored Field Nation work order id (same as `work_order_id` in FN API). |
| `work_order_id` | string | Alt | Accepted as alias for `platform_job_id` if `platform_job_id` is missing. |
| `status` | string | Yes | Field Nation status name, e.g. `Work Done`, `Assigned`, `Cancelled`. |
| `status_name` | string | Alt | Accepted as alias for `status`. |
| `completion_payload` | object | No | TGND completion payload (result, parts_used, notes, etc.). |
| `closing_notes` | string | No | If present and no `completion_payload`, stored as `{ notes: closing_notes }`. |

\* One of `platform_job_id` or `work_order_id` is required.

TGND maps FN status to lifecycle using `fieldNationStatusToTgnd()`:

- `Work Done`, `Approved`, `Paid` → WO `status = completed`
- `Cancelled`, `Deleted`, etc. → `cancelled`
- Other (e.g. `Assigned`) → acknowledged; WO not changed unless we add more transitions later.

---

## Response

- **200** `{ "received": true }` – Webhook accepted (WO updated to completed if applicable, or ack only).
- **400** – Bad request (e.g. missing `platform_job_id`) or completion validation failed (required fields for service_type).

---

## Example (completion)

```json
POST /webhooks/field/fieldnation
{
  "platform_job_id": "fn-mock-abc-123",
  "status": "Work Done",
  "completion_payload": { "result": "success", "parts_used": [] }
}
```

Response: `200 { "received": true }`. TGND finds the WO by `platform_job_id`, runs completion validation (M2.1), and sets WO `status = completed` and stores `completion_payload`.
