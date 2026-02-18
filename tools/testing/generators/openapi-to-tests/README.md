# OpenAPI → Unit Tests Generator

**Purpose:** Generate route/validation and status-code tests from the API OpenAPI spec (e.g. `apps/api/openapi.yaml`).

**Status:** Scaffold. Implement in Phase 1 (see `docs/UNIT_TESTING_GENERATION_SYSTEM.md`).

**Usage (when implemented):**

```bash
node tools/testing/generators/openapi-to-tests/index.js
```

**Output:** Test stubs or full tests for API routes (request/response validation, status codes).

**Owner:** Quinn / Corey
