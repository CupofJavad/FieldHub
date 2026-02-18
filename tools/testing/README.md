# TGND Unit Testing

See `docs/UNIT_TESTING_GENERATION_SYSTEM.md` for the full system.

## Run all tests (from repo root)

```bash
./tools/testing/tgnd-test-run.sh
```

With coverage (when packages use a runner that supports it, e.g. Vitest):

```bash
./tools/testing/tgnd-test-run.sh --coverage
```

## Generators (scaffold)

| Directory | Purpose |
|-----------|--------|
| `generators/openapi-to-tests/` | Generate route/validation tests from OpenAPI spec (Phase 1). |
| `generators/schema-to-tests/` | Generate model/fixture tests from canonical schema (Phase 1–2). |

Until generators are implemented, add tests manually. Use co-location: `*.test.ts` beside `*.ts` or `__tests__/`; naming: `{module}.test.{ts|js}` or `{module}.spec.{ts|js}`.
