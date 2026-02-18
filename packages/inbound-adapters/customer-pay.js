/**
 * Map customer-pay (out-of-warranty) provider payload → canonical work order body.
 * Typical fields: name, address, phone, product, problem, payment ref (see SCT design §3.3).
 */

const { SERVICE_TYPES } = require('@tgnd/canonical-model');

const PROVIDER_KEY = 'customer_pay';
const DEFAULT_PAYER = 'customer_pay';
const DEFAULT_SERVICE = 'osr';

/**
 * @param {object} payload - Provider body (payment_ref, ticket_id, order_id, name, address, phone, product, problem, amount_due, ...)
 * @returns {{ canonical: object } | { error: string }}
 */
function mapCustomerPayToCanonical(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Payload must be an object' };
  }

  const external_id = payload.external_id ?? payload.payment_ref ?? payload.ticket_id ?? payload.order_id ?? payload.reference_id;
  if (!external_id || typeof external_id !== 'string') {
    return { error: 'external_id, payment_ref, ticket_id, or order_id (string) is required' };
  }

  const ship_to = payload.ship_to && typeof payload.ship_to === 'object'
    ? {
        name: payload.ship_to.name ?? payload.name ?? null,
        address_line1: payload.ship_to.address_line1 ?? payload.ship_to.address ?? payload.address ?? null,
        city: payload.ship_to.city ?? payload.city ?? null,
        state: payload.ship_to.state ?? payload.state ?? null,
        zip: payload.ship_to.zip ?? payload.ship_to.postal_code ?? payload.zip ?? null,
        phone: payload.ship_to.phone ?? payload.phone ?? null,
      }
    : (payload.name || payload.address
      ? {
          name: payload.name ?? null,
          address_line1: payload.address ?? payload.address_line1 ?? null,
          city: payload.city ?? null,
          state: payload.state ?? null,
          zip: payload.zip ?? payload.postal_code ?? null,
          phone: payload.phone ?? null,
        }
      : undefined);

  const service_type = payload.service_type && SERVICE_TYPES.includes(payload.service_type)
    ? payload.service_type
    : DEFAULT_SERVICE;

  const pricing = payload.pricing && typeof payload.pricing === 'object'
    ? { ...payload.pricing }
    : {};
  if (payload.amount_due != null) pricing.amount_due = payload.amount_due;
  if (payload.currency) pricing.currency = payload.currency;

  const canonical = {
    external_id: String(external_id).trim(),
    provider_key: payload.provider_key ?? PROVIDER_KEY,
    payer_type: payload.payer_type ?? DEFAULT_PAYER,
    service_type,
    status: payload.status ?? 'received',
    product: payload.product && typeof payload.product === 'object'
      ? payload.product
      : { brand: payload.brand ?? null, model: payload.model ?? null, serial: payload.serial ?? null },
    problem: payload.problem ?? payload.problem_description ?? null,
    instructions: payload.instructions ?? null,
    ship_to: ship_to || undefined,
    requested_date_start: payload.requested_date_start ?? undefined,
    requested_date_end: payload.requested_date_end ?? undefined,
    appointment_date: payload.appointment_date ?? undefined,
    parts: Array.isArray(payload.parts) ? payload.parts : undefined,
    pricing: Object.keys(pricing).length ? pricing : undefined,
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : undefined,
  };

  return { canonical };
}

module.exports = { mapCustomerPayToCanonical, PROVIDER_KEY };
