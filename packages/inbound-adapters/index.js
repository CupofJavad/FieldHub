/**
 * @tgnd/inbound-adapters
 * Provider-specific payload → canonical work order. Use in API routes and batch jobs.
 */

const { mapOemMockToCanonical, PROVIDER_KEY } = require('./oem-mock');

module.exports = {
  mapOemMockToCanonical,
  PROVIDER_KEY,
};
