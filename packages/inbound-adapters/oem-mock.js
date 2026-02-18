/**
 * Map mock OEM provider payload → canonical work order body.
 * Provider shape: PO/RMA, model, serial, problem, ship_to (see SCT design §3.3).
 */

const { SERVICE_TYPES } = require('@tgnd/canonical-model');

const PROVIDER_KEY = 'oem_mock';
const DEFAULT_PAYER = 'oem_in_warranty';
const DEFAULT_SERVICE = 'osr';

/**
 * @param {object} payload - Provider-specific body (e.g. po_number, rma_number, model, serial, problem, ship_to)
 * @returns {{ canonical: object } | { error: string }} - Canonical body for POST /v1/work-orders or validation error
 */
function mapOemMockToCanonical(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Payload must be an object' };
  }

  const external_id = payload.external_id ?? payload.po_number ?? payload.rma_number ?? payload.po;
  if (!external_id || typeof external_id !== 'string') {
    return { error: 'external_id, po_number, or rma_number (string) is required' };
  }

  const ship_to = payload.ship_to && typeof payload.ship_to === 'object'
    ? {
        name: payload.ship_to.name ?? null,
        address_line1: payload.ship_to.address_line1 ?? payload.ship_to.address ?? null,
        city: payload.ship_to.city ?? null,
        state: payload.ship_to.state ?? null,
        zip: payload.ship_to.zip ?? payload.ship_to.postal_code ?? null,
        phone: payload.ship_to.phone ?? null,
      }
    : undefined;

  const service_type = payload.service_type && SERVICE_TYPES.includes(payload.service_type)
    ? payload.service_type
    : DEFAULT_SERVICE;

  const canonical = {
    external_id: String(external_id).trim(),
    provider_key: payload.provider_key ?? PROVIDER_KEY,
    payer_type: payload.payer_type ?? DEFAULT_PAYER,
    service_type,
    status: payload.status ?? 'received',
    product: payload.product && typeof payload.product === 'object'
      ? payload.product
      : {
          brand: payload.brand ?? null,
          model: payload.model ?? null,
          serial: payload.serial ?? null,
        },
    problem: payload.problem ?? payload.problem_code ?? null,
    instructions: payload.instructions ?? null,
    ship_to: ship_to || undefined,
    requested_date_start: payload.requested_date_start ?? undefined,
    requested_date_end: payload.requested_date_end ?? undefined,
    appointment_date: payload.appointment_date ?? undefined,
    parts: Array.isArray(payload.parts) ? payload.parts : undefined,
    pricing: payload.pricing && typeof payload.pricing === 'object' ? payload.pricing : undefined,
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : undefined,
  };

  return { canonical };
}

module.exports = { mapOemMockToCanonical, PROVIDER_KEY };
