/**
 * TGND REST API – work orders (M1.1).
 * POST/GET/PATCH /v1/work-orders; uses @tgnd/logger and canonical model.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const { createLogger } = require('@tgnd/logger');
const { postWorkOrder, getWorkOrder, patchWorkOrder, postAssign } = require('./routes/work-orders');
const { postInboundOemMock } = require('./routes/inbound');
const { postWebhookFieldWorkmarket } = require('./routes/webhooks');

const log = createLogger('api');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

app.post('/v1/work-orders', postWorkOrder);
app.get('/v1/work-orders', getWorkOrder);
app.get('/v1/work-orders/:id', getWorkOrder);
app.patch('/v1/work-orders/:id', patchWorkOrder);
app.post('/v1/work-orders/:id/assign', postAssign);

app.post('/v1/inbound/oem_mock', postInboundOemMock);

app.post('/webhooks/field/workmarket', postWebhookFieldWorkmarket);

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
