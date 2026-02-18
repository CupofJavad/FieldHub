#!/usr/bin/env node
/**
 * Batch ingest: read CSV or JSON file, POST each row/item to the API.
 * - JSON: array of objects. Each object: canonical (external_id, provider_key, ...) or OEM mock (po_number, rma_number, ship_to, ...).
 * - CSV: headers = columns; rows become objects. If columns include po_number or rma_number, POST to /v1/inbound/oem_mock; else POST to /v1/work-orders.
 *
 * Usage: node scripts/ingest-work-orders.js [file] [baseUrl]
 *   file   – path to .json or .csv (default: scripts/fixtures/work-orders.json if present)
 *   baseUrl – API base URL (default: process.env.BASE_URL || http://localhost:3000)
 *
 * Requires: API running. Uses @tgnd/logger.
 */

const path = require('path');
const fs = require('fs');

// Load env from repo root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createLogger } = require(path.join(__dirname, '../packages/logger'));

const log = createLogger('api').child({ jobId: `ingest-${Date.now()}` });

const BASE_URL = process.env.BASE_URL || process.argv[3] || 'http://localhost:3000';
const FILE = process.argv[2] || path.join(__dirname, 'fixtures', 'work-orders.json');

function isOemMockShape(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return (
    obj.provider_key === 'oem_mock' ||
    typeof obj.po_number === 'string' ||
    typeof obj.rma_number === 'string' ||
    (obj.po && typeof obj.po === 'string')
  );
}

function parseJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [data];
}

function parseCsvFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^\s*"/, '').replace(/"\s*$/, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^\s*"/, '').replace(/"\s*$/, ''));
    const obj = {};
    headers.forEach((h, j) => {
      obj[h] = values[j] !== undefined ? values[j] : '';
    });
    rows.push(obj);
  }
  return rows;
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  return { status: res.status, body: json, ok: res.ok };
}

async function main() {
  if (!fs.existsSync(FILE)) {
    log.error('File not found', 'TGND_INGEST_FILE_NOT_FOUND', { file: FILE });
    process.exit(1);
  }

  const ext = path.extname(FILE).toLowerCase();
  let items;
  if (ext === '.json') {
    items = parseJsonFile(FILE);
  } else if (ext === '.csv') {
    items = parseCsvFile(FILE);
  } else {
    log.error('Unsupported file type; use .json or .csv', 'TGND_INGEST_UNSUPPORTED', { file: FILE });
    process.exit(1);
  }

  log.info('Ingest started', null, { file: FILE, baseUrl: BASE_URL, count: items.length });

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const useOemMock = isOemMockShape(item);
    const url = useOemMock
      ? `${BASE_URL}/v1/inbound/oem_mock`
      : `${BASE_URL}/v1/work-orders`;
    const { status, body, ok: resOk } = await post(url, item);
    if (resOk) {
      ok++;
      log.info('Work order created', null, { index: i + 1, id: body.id, external_id: body.external_id });
    } else {
      fail++;
      log.warn('Work order create failed', 'WO_CREATE_FAILED', {
        index: i + 1,
        status,
        error: body.error || body.message,
        code: body.code,
      });
    }
  }

  log.info('Ingest finished', null, { total: items.length, ok, fail });
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  log.error('Ingest failed', 'TGND_INGEST_FAILED', err);
  process.exit(1);
});
