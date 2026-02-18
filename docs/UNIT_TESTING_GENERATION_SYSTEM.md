# TGND Advanced Unit Testing Generation System

**Purpose:** Define how unit tests are generated, organized, and run so the project has consistent, repeatable test coverage.

---

## 1. Principles

- **Co-location:** Unit tests live next to the code they test where practical (e.g. `*.test.ts` beside `*.ts` in same dir) or in a mirror `__tests__/` directory.
- **Naming:** Test files: `{module}.test.{ts|js}` or `{module}.spec.{ts|js}`. Test cases: descriptive names (e.g. `it('returns 400 when external_id is missing')`).
- **Generation:** Tests can be generated from:
  - API contract (OpenAPI): generate request/response validation and status-code tests.
  - Canonical model (WO, provider, service type): generate property and validation tests.
  - Adapter interfaces: generate mock-based tests for each adapter.
- **Harness:** Single test runner (e.g. Vitest, Jest, or pytest) per app/package; root-level script runs all.

---

## 2. Structure

```
apps/api/
  src/
    routes/
      work-orders.ts
      work-orders.test.ts
  vitest.config.ts
packages/canonical-model/
  src/
    work-order.ts
    work-order.test.ts
  vitest.config.ts
tools/testing/
  generators/          # Scripts or configs that generate test stubs
    openapi-to-tests/
    schema-to-tests/
  tgnd-test-run.sh      # Run all tests from repo root
  README.md
```

---

## 3. Generation Sources

| Source | Output | Owner |
|--------|--------|--------|
| OpenAPI spec (e.g. `apps/api/openapi.yaml`) | Route/validation tests | Quinn / Corey |
| Canonical WO schema (TypeScript/JSON) | Model validation and fixture tests | Quinn / Corey |
| Adapter interface (push/update/cancel) | Mock platform tests per adapter | Quinn / Sam |

---

## 4. Commands

- **Generate tests:** `node tools/testing/generators/openapi-to-tests/index.js` (or equivalent; implement in Phase 1).
- **Run all unit tests:** `./tools/testing/tgnd-test-run.sh` (or `npm run test` / `pnpm test` at root if monorepo).
- **Run with coverage:** `./tools/testing/tgnd-test-run.sh --coverage`.

---

## 5. Criteria for “Advanced”

- **Uniform naming** and placement across apps/packages.
- **Generated tests** from API and schema where possible to reduce drift.
- **Single entrypoint** to run full suite and coverage.
- **CI:** Run on every PR; block merge if critical tests fail (Quinn/Jordan set up).

---

*Implementation of generators can be phased; start with manual tests and add generation in Phase 1–2.*
