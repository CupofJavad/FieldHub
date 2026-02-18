# TGND Deployment Checks (M4.5)

**Purpose:** Pre-production checks so Jordan (and Quinn) can verify tests and env before deploy. Run from repo root.

---

## Quick run

```bash
./tools/deployment/deploy-check.sh
```

- Runs the full test suite (`./tools/testing/tgnd-test-run.sh`).
- Checks for required env vars (see below). Does **not** start the server or run migrations.

---

## Required for production

| Variable | Used by | Notes |
|--------|---------|--------|
| `DATABASE_URL` | API, migrations | Postgres connection string. Set in `.env` (do not commit). |
| `PORT` | API | Optional; defaults to 3000. |

API integration tests skip when `DATABASE_URL` is unset; set it to run full API test suite before deploy.

---

## Before deploy (Jordan)

1. Run `./tools/deployment/deploy-check.sh`. Fix any test failures.
2. Ensure `DATABASE_URL` and `PORT` (if needed) are set in the target environment.
3. Run migrations: `cd apps/api && npm run migrate` (or use your deployment script).
4. Start API: `cd apps/api && npm start`. Portal: `cd apps/portal && npm run build && npm run preview` (or serve static build).
5. See `docs/PRE_START_ACTIONS_AND_SERVER.md` for server and env setup.

---

*Quinn: M4.5 – tests and deployment checks in place. Jordan: production deployment and final GitHub sync.*
