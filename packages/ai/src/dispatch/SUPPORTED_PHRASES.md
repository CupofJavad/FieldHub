# Supported phrases (M3.4 conversational dispatch)

Rule-based parsing. Human must confirm before executing any suggested API action.

## Intents

| Intent | Description | Example phrases |
|--------|-------------|-----------------|
| `schedule_wo` | Schedule or get slots | "schedule the next available", "book for zip 95834", "set appointment", "ready to schedule", "next available for 95834" |
| `list_open` | List open/pending WOs | "list open work orders", "show pending", "get scheduling jobs", "find unassigned WOs" |
| `assign_wo` | Assign a WO to platform | "assign wo abc-123", "dispatch work order xyz", "assign 550e8400-e29b-41d4-a716-446655440000" |
| `unknown` | Not recognized | (no keyword match) |

## Entities (extracted when present)

- **zip** – 5-digit US zip (e.g. 95834)
- **wo_id** – UUID or hex id (e.g. 550e8400-e29b-41d4-a716-446655440000)
- **date** – "tomorrow", "next week", or YYYY-MM-DD

## Suggested actions (API bridge)

- `list_open` → GET /v1/work-orders?status=scheduling, GET /v1/work-orders?status=parts_shipped
- `schedule_wo` → GET /v1/ai/scheduling-suggestions (optional ?wo_id=, ?slots_count=5)
- `assign_wo` + wo_id → POST /v1/work-orders/:id/assign (human confirm)
- `assign_wo` without wo_id → GET /v1/work-orders?status=scheduling

No autonomous execution; client/Report Center shows suggested_actions and user confirms.
