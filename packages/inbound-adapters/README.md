# @tgnd/inbound-adapters

Provider-specific payload → canonical work order. Used by API routes, inbound webhooks, and batch scripts.

## Mappers

- **oem_mock** – `mapOemMockToCanonical(payload)`  
  Accepts: `external_id` or `po_number` or `rma_number`, `ship_to`, `problem`, `model`, `serial`, `brand`, `service_type`, etc.  
  Returns: `{ canonical }` or `{ error }`.

- **ext_warranty_new** – `mapExtWarrantyNewToCanonical(payload)`  
  Accepts: `external_id` or `auth_number` or `ticket_id` or `claim_id`, `auth_limit`, `claim_type`, `ship_to`, `problem`, `product`, etc.  
  Sets `payer_type=ext_warranty`, stores auth/claim in metadata/pricing. Returns: `{ canonical }` or `{ error }`.

- **customer_pay** – `mapCustomerPayToCanonical(payload)` (M4.1)  
  Accepts: `external_id` or `payment_ref` or `ticket_id` or `order_id`, `name`, `address`, `phone`, `ship_to`, `product`, `problem`, `amount_due`, etc.  
  Sets `payer_type=customer_pay`. For customer-pay portal / out-of-warranty. Returns: `{ canonical }` or `{ error }`.

- **oem_vizio** – `mapOemVizioToCanonical(payload)` (M4.1)  
  Accepts: `external_id` or `po_number` or `order_number` or `rma_number`, `ship_to`, `problem`, `model`, `serial`, `osr_creation_date`, etc.  
  Sets `payer_type=oem_in_warranty`, default brand VIZIO. VIZIO/TPV-style OEM. Returns: `{ canonical }` or `{ error }`.

## Registry

- `getMapperForProvider(provider_key)` – returns mapper function or null.
- `getSupportedInboundProviders()` – returns `['oem_mock', 'ext_warranty_new', 'customer_pay', 'oem_vizio']`.

## Usage

- **API routes:** `POST /v1/inbound/oem_mock`, `POST /v1/inbound/ext_warranty_new`, `POST /v1/inbound/customer_pay`, `POST /v1/inbound/oem_vizio` (see `apps/api/src/routes/inbound.js`).
- **Webhook:** `POST /webhooks/inbound/:provider_key` – any registered provider (see `apps/api/src/routes/webhooks-inbound.js`).
- **Batch:** `scripts/ingest-work-orders.js` reads CSV/JSON and POSTs to the API (customer_pay, ext_warranty_new, oem_vizio, oem_mock, or canonical).
