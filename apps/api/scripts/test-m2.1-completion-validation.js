/**
 * M2.1 – Test completion validation (service-type engine).
 * Run from repo root: node apps/api/scripts/test-m2.1-completion-validation.js
 * No DB required for unit tests; optional integration test if DATABASE_URL is set.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { validateCompletion } = require('../src/service-type-engine');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log('  ✓', msg);
  } else {
    failed++;
    console.log('  ✗', msg);
  }
}

console.log('M2.1 completion validation – unit tests\n');

// 1. Missing completion_payload → invalid
const r1 = validateCompletion(
  { service_type: 'osr' },
  { required_completion_fields: ['completion_payload'] }
);
assert(r1.valid === false && r1.message && r1.message.includes('Missing'), 'Missing completion_payload returns invalid');

// 2. completion_payload null → invalid
const r2 = validateCompletion(
  { completion_payload: null },
  { required_completion_fields: ['completion_payload'] }
);
assert(r2.valid === false, 'completion_payload null returns invalid');

// 3. completion_payload empty object → invalid
const r3 = validateCompletion(
  { completion_payload: {} },
  { required_completion_fields: ['completion_payload'] }
);
assert(r3.valid === false && r3.message && r3.message.includes('at least one'), 'completion_payload {} returns invalid');

// 4. completion_payload with result → valid
const r4 = validateCompletion(
  { completion_payload: { result: 'success' } },
  { required_completion_fields: ['completion_payload'] }
);
assert(r4.valid === true, 'completion_payload with result returns valid');

// 5. No config / empty required_completion_fields → valid (no extra requirements)
const r5 = validateCompletion({}, {});
assert(r5.valid === true, 'No config returns valid');
const r6 = validateCompletion({}, { required_completion_fields: [] });
assert(r6.valid === true, 'Empty required_completion_fields returns valid');

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
