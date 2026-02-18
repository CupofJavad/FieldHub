# @tgnd/inbound-adapters

Provider-specific payload → canonical work order. Used by API routes, inbound webhooks, and batch scripts.

## Mappers

- **oem_mock** – `mapOemMockToCanonical(payload)`  
  Accepts: `external_id` or `po_number` or `rma_number`, `ship_to`, `problem`, `model`, `serial`, `brand`, `service_type`, etc.  
  Returns: `{ canonical }` or `{ error }`.

- **ext_warranty_new** – `mapExtWarrantyNewToCanonical(payload)`  
  Accepts: `external_id` or `auth_number` or `ticket_id` or `claim_id`, `auth_limit`, `claim_type`, `ship_to`, `problem`, `product`, etc.  
  Sets `payer_type=ext_warranty`, stores auth/claim in metadata/pricing. Returns: `{ canonical }` or `{ error }`.

## Registry

- `getMapperForProvider(provider_key)` – returns mapper function or null.
- `getSupportedInboundProviders()` – returns `['oem_mock', 'ext_warranty_new']`.

## Usage

- **API routes:** `POST /v1/inbound/oem_mock`, `POST /v1/inbound/ext_warranty_new` (see `apps/api/src/routes/inbound.js`).
- **Webhook:** `POST /webhooks/inbound/:provider_key` – any registered provider (see `apps/api/src/routes/webhooks-inbound.js`).
- **Batch:** `scripts/ingest-work-orders.js` reads CSV/JSON and POSTs to the API (oem_mock, ext_warranty_new, or canonical).
