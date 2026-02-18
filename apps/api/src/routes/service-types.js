/**
 * GET /v1/service-types – M2.1: expose service_type_config for Report Center and validation
 */

const { getAllServiceTypeConfigs } = require('../db');

async function getServiceTypes(req, res) {
  try {
    const configs = await getAllServiceTypeConfigs();
    return res.json({ service_types: configs });
  } catch (err) {
    const { createLogger } = require('@tgnd/logger');
    createLogger('api').error('Get service types failed', 'SERVICE_TYPES_FETCH_FAILED', err);
    return res.status(500).json({ error: 'Failed to fetch service types', code: 'SERVICE_TYPES_FETCH_FAILED' });
  }
}

module.exports = { getServiceTypes };
