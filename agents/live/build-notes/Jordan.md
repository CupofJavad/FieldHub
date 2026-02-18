# Build notes: Jordan (DevOps, Security & Deployment)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M4.4 & M4.5 (Security, audit, backup, monitoring; deployment)

**M4.4 implemented:**
- **Auth:** Optional API key via `TGND_API_KEY` or `API_KEY`; `X-API-Key` or `Authorization: Bearer`; `/health` and `/ready` always public.
- **Audit log:** Migration `00004_audit_log.sql`; `insertAuditLog` in db.js; `recordAudit()` in middleware/audit.js; work-orders routes log create/patch/assign.
- **Rate limits:** In-memory per-IP in middleware/rateLimit.js; `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`; 429 and X-RateLimit-* headers.
- **Backup:** `scripts/backup-db.sh` (pg_dump + optional config tarball); doc in docs/M4.4_SECURITY_AND_OPERATIONS.md.
- **Monitoring:** `/health` (liveness), `/ready` (DB ping); doc for log shipping and error rate.

**M4.5 implemented:**
- **Deployment check:** `scripts/deployment-check.sh` runs test suite and optional health/ready curl; exit 1 if tests fail.
- **Production deployment doc:** docs/M4.5_PRODUCTION_DEPLOYMENT.md (steps, Quinn test verification).
- **Tests:** Full tgnd-test-run.sh and apps/api npm test passed. Quinn continues to own test authoring; deployment check runs existing suite.

**Files added/updated:** db/migrations/00004_audit_log.sql, apps/api/src/middleware/auth.js, rateLimit.js, audit.js, apps/api/src/db.js (insertAuditLog), server.js (auth, rate limit, /ready), work-orders.js (recordAudit), scripts/backup-db.sh, deployment-check.sh, docs/M4.4_SECURITY_AND_OPERATIONS.md, docs/M4.5_PRODUCTION_DEPLOYMENT.md.

---

## 2026-02-18 – Phase 2 complete GitHub sync

- **Check again:** CHECKLIST showed Phase 2 fully complete (M2.1–M2.5 all Done). Updated STATUS to Phase 2 complete, Phase 3 active; refreshed next-action table for all agents. Updated CHECKLIST header (Phase 2 complete, Phase 3 focus).
- **Git:** Committed `bd684a2`: "TGND Phase 2 complete: M2.2 M2.5 Done (Riley); STATUS Phase 3; CHECKLIST/Phase2/Riley build-notes; export route, portal". Pushed to `origin main`. Push succeeded.
- **Next:** GitHub sync after Phase 3 complete; Jordan M4.4, M4.5 in Phase 4.

---

## 2026-02-18 – Phase 2 in-progress GitHub sync

- **Requested:** Run Phase 2 GitHub sync per CHECKLIST/STATUS.
- **CHECKLIST state:** Phase 2 not fully complete — M2.1 Done, M2.3 Done; M2.2, M2.4, M2.5 still Pending (Riley, Sam). Ran **in-progress sync** so current work is backed up and repo is up to date.
- **Git:** Verified .env not staged. Committed all changes as `6cf6563`: "TGND Phase 2 in progress: M2.1 service-type engine, M2.3 ext-warranty/webhooks, Phase2 handoff/prompts/checklist, portal scaffold, migrations; agent updates". Pushed to `origin main`. Push succeeded.
- **Full Phase 2 sync:** When M2.2, M2.4, M2.5 are Done, run another commit/push and mark Phase 2 complete in STATUS.

---

## 2026-02-18 – Phase 1 GitHub sync

- **Assignment:** After M1.2 and M1.5 Done, run Phase 1 GitHub sync and update coordination.
- **Done:** CHECKLIST already showed Phase 1 complete (M1.2, M1.5 Done). Confirmed STATUS.md reflected Phase 1 complete and Phase 2 active; table already had Phase 2 next actions for most agents.
- **Git:** Staged all changes (verified .env not staged, .gitignore in place). Committed as `bf2091c`: "TGND Phase 1 complete: M1.1–M1.5 (API, DB, provider mapping, assign/completion); agent checklists, build-notes, Phase 2 STATUS". Pushed to `origin main` (git@github.com:CupofJavad/FieldHub.git). Push succeeded.
- **No issues.** Next: GitHub sync after Phase 2 complete; Jordan’s next Pending tasks are M4.4, M4.5 (Phase 4).

---
