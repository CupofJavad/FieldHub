/**
 * Map extended-warranty provider (NEW-style) payload → canonical work order body.
 * Typical fields: auth_number, limit, DIAG vs repair, part escalation (see SCT design §3.3).
 */

const { SERVICE_TYPES } = require('@tgnd/canonical-model');

const PROVIDER_KEY = 'ext_warranty_new';
const DEFAULT_PAYER = 'ext_warranty';
const DEFAULT_SERVICE = 'osr';

/**
 * @param {object} payload - Provider body (auth_number, auth_limit, claim_type, external_id, ticket_id, ship_to, problem, ...)
 * @returns {{ canonical: object } | { error: string }}
 */
function mapExtWarrantyNewToCanonical(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Payload must be an object' };
  }

  const external_id = payload.external_id ?? payload.auth_number ?? payload.ticket_id ?? payload.claim_id;
  if (!external_id || typeof external_id !== 'string') {
    return { error: 'external_id, auth_number, ticket_id, or claim_id (string) is required' };
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

  const pricing = payload.pricing && typeof payload.pricing === 'object'
    ? payload.pricing
    : {};
  if (payload.auth_limit != null) {
    pricing.auth_limit = payload.auth_limit;
  }

  const metadata = payload.metadata && typeof payload.metadata === 'object'
    ? { ...payload.metadata }
    : {};
  if (payload.auth_number != null) metadata.auth_number = payload.auth_number;
  if (payload.claim_type != null) metadata.claim_type = payload.claim_type; // e.g. diag vs repair
  if (payload.part_escalation != null) metadata.part_escalation = payload.part_escalation;

  const canonical = {
    external_id: String(external_id).trim(),
    provider_key: payload.provider_key ?? PROVIDER_KEY,
    payer_type: payload.payer_type ?? DEFAULT_PAYER,
    service_type,
    status: payload.status ?? 'received',
    product: payload.product && typeof payload.product === 'object'
      ? payload.product
      : { brand: payload.brand ?? null, model: payload.model ?? null, serial: payload.serial ?? null },
    problem: payload.problem ?? payload.problem_code ?? null,
    instructions: payload.instructions ?? null,
    ship_to: ship_to || undefined,
    requested_date_start: payload.requested_date_start ?? undefined,
    requested_date_end: payload.requested_date_end ?? undefined,
    appointment_date: payload.appointment_date ?? undefined,
    parts: Array.isArray(payload.parts) ? payload.parts : undefined,
    pricing: Object.keys(pricing).length ? pricing : undefined,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  };

  return { canonical };
}

module.exports = { mapExtWarrantyNewToCanonical, PROVIDER_KEY };
