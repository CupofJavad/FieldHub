/**
 * TGND REST API – work orders (M1.1).
 * POST/GET/PATCH /v1/work-orders; uses @tgnd/logger and canonical model.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const { createLogger } = require('@tgnd/logger');
const { postWorkOrder, getWorkOrder, patchWorkOrder, postAssign, getExport } = require('./routes/work-orders');
const { getServiceTypes } = require('./routes/service-types');
const { postInboundOemMock, postInboundExtWarrantyNew } = require('./routes/inbound');
const { postWebhookFieldWorkmarket, postWebhookFieldNation } = require('./routes/webhooks');
const { postWebhookInbound } = require('./routes/webhooks-inbound');
const {
  getSchedulingSuggestionsHandler,
  getAnomaliesHandler,
  postExtractNotesHandler,
  postDispatchParseHandler,
  postAgentsPartsSuggestHandler,
  postAgentsClaimsPrepareHandler,
  postAgentsTechCommsSuggestHandler,
} = require('./routes/ai');

const log = createLogger('api');
const app = express();
app.use(express.json());

// CORS: allow portal (and other origins in dev) to call API
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

app.post('/v1/work-orders', postWorkOrder);
app.get('/v1/work-orders/export', getExport);
app.get('/v1/work-orders', getWorkOrder);
app.get('/v1/work-orders/:id', getWorkOrder);
app.patch('/v1/work-orders/:id', patchWorkOrder);
app.post('/v1/work-orders/:id/assign', postAssign);

app.get('/v1/service-types', getServiceTypes);

app.post('/v1/inbound/oem_mock', postInboundOemMock);
app.post('/v1/inbound/ext_warranty_new', postInboundExtWarrantyNew);

app.post('/webhooks/field/workmarket', postWebhookFieldWorkmarket);
app.post('/webhooks/field/fieldnation', postWebhookFieldNation);
app.post('/webhooks/inbound/:provider_key', postWebhookInbound);

app.get('/v1/ai/scheduling-suggestions', getSchedulingSuggestionsHandler);
app.get('/v1/ai/anomalies', getAnomaliesHandler);
app.post('/v1/ai/extract-notes', postExtractNotesHandler);
app.post('/v1/ai/dispatch-parse', postDispatchParseHandler);
app.post('/v1/ai/agents/parts/suggest', postAgentsPartsSuggestHandler);
app.post('/v1/ai/agents/claims/prepare', postAgentsClaimsPrepareHandler);
app.post('/v1/ai/agents/tech-comms/suggest', postAgentsTechCommsSuggestHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    log.info('API listening', null, { port });
  });
}

module.exports = { app, port };
