/**
 * TGND REST API – work orders (M1.1).
 * POST/GET/PATCH /v1/work-orders; uses @tgnd/logger and canonical model.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const { createLogger } = require('@tgnd/logger');
const { postWorkOrder, getWorkOrder, patchWorkOrder, postAssign, getPool, getFieldPlatforms, getExport, postPrepareClaim, postSubmitClaim } = require('./routes/work-orders');
const { getServiceTypes } = require('./routes/service-types');
const {
  postInboundOemMock,
  postInboundExtWarrantyNew,
  postInboundCustomerPay,
  postInboundOemVizio,
} = require('./routes/inbound');
const { postWebhookFieldWorkmarket, postWebhookFieldNation } = require('./routes/webhooks');
const { postWebhookInbound } = require('./routes/webhooks-inbound');
const {
  getSchedulingSuggestionsHandler,
  getAnomaliesHandler,
  postExtractNotesHandler,
  postDispatchParseHandler,
  postAgentsPartsSuggestHandler,
  postAgentsClaimsPrepareHandler,
  postAgentsClaimsSubmissionHandler,
  postAgentsClaimsIngestResponseHandler,
  postAgentsTechCommsSuggestHandler,
} = require('./routes/ai');

const log = createLogger('api');
const { requireApiKey } = require('./middleware/auth');
const { rateLimitByIp } = require('./middleware/rateLimit');
const { pool } = require('./db');

const app = express();
app.use(express.json());

// M4.4: Rate limit by IP (before auth so /health is limited but not key-protected)
app.use(rateLimitByIp);

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

// M4.4: Optional API key auth (if TGND_API_KEY or API_KEY set). /health is always public.
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/ready') return next();
  return requireApiKey(req, res, next);
});

app.post('/v1/work-orders', postWorkOrder);
app.get('/v1/work-orders/export', getExport);
app.get('/v1/work-orders/pool', getPool);
app.get('/v1/work-orders', getWorkOrder);
app.get('/v1/work-orders/:id', getWorkOrder);
app.patch('/v1/work-orders/:id', patchWorkOrder);
app.post('/v1/work-orders/:id/assign', postAssign);
app.post('/v1/work-orders/:id/prepare-claim', postPrepareClaim);
app.post('/v1/work-orders/:id/submit-claim', postSubmitClaim);

app.get('/v1/service-types', getServiceTypes);
app.get('/v1/field-platforms', getFieldPlatforms);

app.post('/v1/inbound/oem_mock', postInboundOemMock);
app.post('/v1/inbound/ext_warranty_new', postInboundExtWarrantyNew);
app.post('/v1/inbound/customer_pay', postInboundCustomerPay);
app.post('/v1/inbound/oem_vizio', postInboundOemVizio);

app.post('/webhooks/field/workmarket', postWebhookFieldWorkmarket);
app.post('/webhooks/field/fieldnation', postWebhookFieldNation);
app.post('/webhooks/inbound/:provider_key', postWebhookInbound);

app.get('/v1/ai/scheduling-suggestions', getSchedulingSuggestionsHandler);
app.get('/v1/ai/anomalies', getAnomaliesHandler);
app.post('/v1/ai/extract-notes', postExtractNotesHandler);
app.post('/v1/ai/dispatch-parse', postDispatchParseHandler);
app.post('/v1/ai/agents/parts/suggest', postAgentsPartsSuggestHandler);
app.post('/v1/ai/agents/claims/prepare', postAgentsClaimsPrepareHandler);
app.post('/v1/ai/agents/claims/submission-payload', postAgentsClaimsSubmissionHandler);
app.post('/v1/ai/agents/claims/ingest-response', postAgentsClaimsIngestResponseHandler);
app.post('/v1/ai/agents/tech-comms/suggest', postAgentsTechCommsSuggestHandler);

// M4.4: Health (liveness) and readiness (DB ping)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'api', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', service: 'api', db: 'disconnected', error: err.message });
  }
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    log.info('API listening', null, { port });
  });
}

module.exports = { app, port };
