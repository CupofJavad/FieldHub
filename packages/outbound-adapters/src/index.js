/**
 * @file index.js
 * TGND outbound adapters: field platform interface and implementations.
 * WorkMarket: https://employer-api.workmarket.com/reference/getting-started
 * Field Nation: https://developer.fieldnation.com/client-api/webhooks/howitworks/
 */

const { IFieldPlatformAdapter } = require('./interface.js');
const { createWorkMarketAdapter, mockSetStatus, PLATFORM_TYPE } = require('./workmarket/adapter.js');
const {
  createFieldNationAdapter,
  fieldNationStatusToTgnd,
  tgndToFieldNationCreatePayload,
} = require('./fieldnation/adapter.js');
const { createInternalAdapter } = require('./internal/adapter.js');

const AVAILABLE_PLATFORM_TYPES = ['workmarket', 'fieldnation', 'internal'];

function getAvailablePlatformTypes() {
  return [...AVAILABLE_PLATFORM_TYPES];
}

module.exports = {
  IFieldPlatformAdapter,
  createWorkMarketAdapter,
  createFieldNationAdapter,
  createInternalAdapter,
  mockSetStatus,
  PLATFORM_TYPE,
  fieldNationStatusToTgnd,
  tgndToFieldNationCreatePayload,
  getAvailablePlatformTypes,
};
