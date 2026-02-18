/**
 * @file index.js
 * TGND outbound adapters: field platform interface and implementations.
 * M1.4: One field platform adapter (WorkMarket) – push job, platform_job_id, status sync.
 */

const { IFieldPlatformAdapter } = require('./interface.js');
const { createWorkMarketAdapter, mockSetStatus, PLATFORM_TYPE } = require('./workmarket/adapter.js');

module.exports = {
  IFieldPlatformAdapter,
  createWorkMarketAdapter,
  mockSetStatus,
  PLATFORM_TYPE,
  /** For future: createFieldNationAdapter, etc. */
};
