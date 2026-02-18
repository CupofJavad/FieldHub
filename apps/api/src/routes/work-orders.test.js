/**
 * Integration tests for POST/GET/PATCH /v1/work-orders, assign, and webhook.
 * Requires DATABASE_URL. Run: npm test (from apps/api).
 * See docs/PHASE1_M1.2_M1.5_HANDOFF.md §1 and §4.
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const path = require('path');

// Load env from repo root (same as server)
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
  console.warn('Skip API tests: DATABASE_URL not set. Set DATABASE_URL to run work-orders and M1.5 tests.');
  process.exit(0);
}

const { app } = require('../server');
const { runMigration } = require('../db');
const { createLogger } = require('@tgnd/logger');
const log = createLogger('api-test');

const minimalWo = {
  external_id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  provider_key: 'oem_mock',
  payer_type: 'oem_in_warranty',
  service_type: 'osr',
};

describe('POST /v1/work-orders', () => {
  before(async () => {
    try {
      await runMigration();
    } catch (e) {
      log.error('Migration failed', null, e);
      throw e;
    }
  });

  it('returns 400 when external_id is missing', async () => {
    const res = await request(app)
      .post('/v1/work-orders')
      .send({ provider_key: 'oem_mock', payer_type: 'oem_in_warranty', service_type: 'osr' })
      .expect(400);
    assert.match(res.body.error, /external_id/);
    assert.strictEqual(res.body.code, 'WO_VALIDATION_FAILED');
  });

  it('returns 400 when provider_key is missing', async () => {
    const res = await request(app)
      .post('/v1/work-orders')
      .send({ external_id: 'x', payer_type: 'oem_in_warranty', service_type: 'osr' })
      .expect(400);
    assert.match(res.body.error, /provider_key/);
    assert.strictEqual(res.body.code, 'WO_VALIDATION_FAILED');
  });

  it('returns 400 when payer_type is invalid', async () => {
    const res = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, payer_type: 'invalid' })
      .expect(400);
    assert.match(res.body.error, /payer_type/);
    assert.strictEqual(res.body.code, 'WO_VALIDATION_FAILED');
  });

  it('returns 400 when service_type is invalid', async () => {
    const res = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, service_type: 'invalid' })
      .expect(400);
    assert.match(res.body.error, /service_type/);
    assert.strictEqual(res.body.code, 'WO_VALIDATION_FAILED');
  });

  it('returns 201 with id, external_id, status for valid minimal body', async () => {
    const res = await request(app)
      .post('/v1/work-orders')
      .send(minimalWo)
      .expect(201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.external_id, minimalWo.external_id);
    assert.strictEqual(res.body.status, 'received');
  });
});

describe('GET /v1/work-orders', () => {
  it('returns 400 when neither :id nor provider+external_id provided', async () => {
    const res = await request(app).get('/v1/work-orders').expect(400);
    assert.strictEqual(res.body.code, 'WO_GET_BAD_REQUEST');
  });

  it('returns 404 for nonexistent id', async () => {
    await request(app)
      .get('/v1/work-orders/00000000-0000-0000-0000-000000000000')
      .expect(404)
      .expect((res) => assert.strictEqual(res.body.code, 'WO_NOT_FOUND'));
  });

  it('returns 200 and WO by id after POST', async () => {
    const extId = `get-by-id-${Date.now()}`;
    const post = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    const id = post.body.id;
    const get = await request(app).get(`/v1/work-orders/${id}`).expect(200);
    assert.strictEqual(get.body.id, id);
    assert.strictEqual(get.body.external_id, extId);
    assert.strictEqual(get.body.provider_key, minimalWo.provider_key);
  });

  it('returns 200 and WO by provider+external_id', async () => {
    const extId = `get-by-query-${Date.now()}`;
    await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    const get = await request(app)
      .get('/v1/work-orders')
      .query({ provider: minimalWo.provider_key, external_id: extId })
      .expect(200);
    assert.strictEqual(get.body.external_id, extId);
  });
});

describe('PATCH /v1/work-orders/:id', () => {
  it('returns 404 for nonexistent id', async () => {
    await request(app)
      .patch('/v1/work-orders/00000000-0000-0000-0000-000000000000')
      .send({ status: 'parts_ordered' })
      .expect(404);
  });

  it('returns 400 for invalid status', async () => {
    const post = await request(app).post('/v1/work-orders').send(minimalWo).expect(201);
    const res = await request(app)
      .patch(`/v1/work-orders/${post.body.id}`)
      .send({ status: 'invalid_status' })
      .expect(400);
    assert.strictEqual(res.body.code, 'WO_VALIDATION_FAILED');
  });

  it('returns 409 for invalid lifecycle transition', async () => {
    const post = await request(app).post('/v1/work-orders').send(minimalWo).expect(201);
    const res = await request(app)
      .patch(`/v1/work-orders/${post.body.id}`)
      .send({ status: 'completed' })
      .expect(409);
    assert.strictEqual(res.body.code, 'WO_LIFECYCLE_INVALID');
  });

  it('returns 200 and updated WO for valid transition', async () => {
    const extId = `patch-${Date.now()}`;
    const post = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    const patch = await request(app)
      .patch(`/v1/work-orders/${post.body.id}`)
      .send({ status: 'parts_ordered' })
      .expect(200);
    assert.strictEqual(patch.body.status, 'parts_ordered');
  });
});

describe('POST /v1/work-orders/:id/assign', () => {
  it('returns 404 for nonexistent id', async () => {
    await request(app)
      .post('/v1/work-orders/00000000-0000-0000-0000-000000000000/assign')
      .expect(404);
  });

  it('returns 409 when WO status is not assignable', async () => {
    const post = await request(app).post('/v1/work-orders').send(minimalWo).expect(201);
    const res = await request(app)
      .post(`/v1/work-orders/${post.body.id}/assign`)
      .expect(409);
    assert.strictEqual(res.body.code, 'WO_ASSIGN_INVALID_STATUS');
  });

  it('returns 200 and sets platform_job_id when WO is in scheduling', async () => {
    const extId = `assign-${Date.now()}`;
    const post = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    await request(app)
      .patch(`/v1/work-orders/${post.body.id}`)
      .send({ status: 'scheduling' })
      .expect(200);
    const assign = await request(app)
      .post(`/v1/work-orders/${post.body.id}/assign`)
      .expect(200);
    assert.strictEqual(assign.body.status, 'assigned');
    assert.ok(assign.body.platform_job_id);
    assert.ok(assign.body.platform_type);
  });

  it('returns 409 when WO already assigned', async () => {
    const extId = `assign-twice-${Date.now()}`;
    const post = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    await request(app).patch(`/v1/work-orders/${post.body.id}`).send({ status: 'scheduling' }).expect(200);
    await request(app).post(`/v1/work-orders/${post.body.id}/assign`).expect(200);
    const res = await request(app).post(`/v1/work-orders/${post.body.id}/assign`).expect(409);
    assert.strictEqual(res.body.code, 'WO_ALREADY_ASSIGNED');
  });
});

describe('POST /webhooks/field/workmarket', () => {
  it('returns 400 when platform_job_id is missing', async () => {
    const res = await request(app)
      .post('/webhooks/field/workmarket')
      .send({ status: 'completed' })
      .expect(400);
    assert.strictEqual(res.body.code, 'WEBHOOK_BAD_REQUEST');
  });

  it('returns 200 received:true for unknown platform_job_id', async () => {
    const res = await request(app)
      .post('/webhooks/field/workmarket')
      .send({ platform_job_id: 'unknown-job-123', status: 'completed' })
      .expect(200);
    assert.strictEqual(res.body.received, true);
  });

  it('updates WO to completed when webhook status=completed', async () => {
    const extId = `webhook-${Date.now()}`;
    const post = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId })
      .expect(201);
    await request(app).patch(`/v1/work-orders/${post.body.id}`).send({ status: 'scheduling' }).expect(200);
    const assign = await request(app).post(`/v1/work-orders/${post.body.id}/assign`).expect(200);
    const platformJobId = assign.body.platform_job_id;
    await request(app)
      .post('/webhooks/field/workmarket')
      .send({ platform_job_id: platformJobId, status: 'completed' })
      .expect(200);
    const get = await request(app).get(`/v1/work-orders/${post.body.id}`).expect(200);
    assert.strictEqual(get.body.status, 'completed');
  });
});

describe('M1.5 E2E: provider → assign → completion', () => {
  it('full flow: create WO → scheduling → assign → webhook completed', async () => {
    const extId = `e2e-${Date.now()}`;
    const create = await request(app)
      .post('/v1/work-orders')
      .send({ ...minimalWo, external_id: extId, problem: 'No power' })
      .expect(201);
    const id = create.body.id;
    await request(app).patch(`/v1/work-orders/${id}`).send({ status: 'scheduling' }).expect(200);
    const assign = await request(app).post(`/v1/work-orders/${id}/assign`).expect(200);
    assert.strictEqual(assign.body.status, 'assigned');
    assert.ok(assign.body.platform_job_id);
    await request(app)
      .post('/webhooks/field/workmarket')
      .send({ platform_job_id: assign.body.platform_job_id, status: 'completed' })
      .expect(200);
    const final = await request(app).get(`/v1/work-orders/${id}`).expect(200);
    assert.strictEqual(final.body.status, 'completed');
    assert.strictEqual(final.body.external_id, extId);
  });
});
