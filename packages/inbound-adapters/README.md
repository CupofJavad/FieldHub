# @tgnd/inbound-adapters

Provider-specific payload → canonical work order. Used by API routes and batch scripts.

## Mappers

- **oem_mock** – `mapOemMockToCanonical(payload)`  
  Accepts: `external_id` or `po_number` or `rma_number`, `ship_to`, `problem`, `model`, `serial`, `brand`, `service_type`, etc.  
  Returns: `{ canonical }` or `{ error }`.

## Usage

Use in API: `POST /v1/inbound/oem_mock` (see `apps/api/src/routes/inbound.js`).  
Use in batch: `scripts/ingest-work-orders.js` reads CSV/JSON and POSTs to the API.
