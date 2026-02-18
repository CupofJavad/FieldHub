/**
 * @tgnd/inbound-adapters
 * Provider-specific payload → canonical work order. Use in API routes and batch jobs.
 */

const oemMock = require('./oem-mock');
const extWarranty = require('./ext-warranty-new');
const customerPay = require('./customer-pay');
const oemVizio = require('./oem-vizio');

/** Registry: provider_key → mapper(payload) => { canonical } | { error } */
const INBOUND_MAPPERS = Object.freeze({
  [oemMock.PROVIDER_KEY]: oemMock.mapOemMockToCanonical,
  [extWarranty.PROVIDER_KEY]: extWarranty.mapExtWarrantyNewToCanonical,
  [customerPay.PROVIDER_KEY]: customerPay.mapCustomerPayToCanonical,
  [oemVizio.PROVIDER_KEY]: oemVizio.mapOemVizioToCanonical,
});

function getMapperForProvider(provider_key) {
  return INBOUND_MAPPERS[provider_key] ?? null;
}

function getSupportedInboundProviders() {
  return Object.keys(INBOUND_MAPPERS);
}

module.exports = {
  mapOemMockToCanonical: oemMock.mapOemMockToCanonical,
  PROVIDER_KEY: oemMock.PROVIDER_KEY,
  mapExtWarrantyNewToCanonical: extWarranty.mapExtWarrantyNewToCanonical,
  EXT_WARRANTY_NEW_KEY: extWarranty.PROVIDER_KEY,
  mapCustomerPayToCanonical: customerPay.mapCustomerPayToCanonical,
  CUSTOMER_PAY_KEY: customerPay.PROVIDER_KEY,
  mapOemVizioToCanonical: oemVizio.mapOemVizioToCanonical,
  OEM_VIZIO_KEY: oemVizio.PROVIDER_KEY,
  INBOUND_MAPPERS,
  getMapperForProvider,
  getSupportedInboundProviders,
};
