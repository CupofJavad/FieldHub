# TGND GitHub Sync Instructions

**Purpose:** When and how to push the TGND project to the owner’s GitHub repo. Executor: **Jordan** (or **Archie** if Jordan is unavailable). Owner: Javad Khoshnevisan.

---

## 1. What Must Stay Private

- **Never commit:** `.env` and any file with secrets (API keys, passwords, tokens). `.gitignore` must include `.env`, `.env.*`, and `secrets/`.
- **Never commit:** Credentials from the project start prompt template (GitHub, server, DB, etc.) or any credential file.
- **Review before each push:** Ensure no secret or sensitive path is staged.

---

## 2. When to Push

| Trigger | Action |
|---------|--------|
| **After Phase 0 complete** | First push: repo init (if needed), `.gitignore` in place, all Phase 0 deliverables committed. |
| **After Phase 1 complete** (M1.5 done) | Push with message e.g. `TGND Phase 1 complete: MVP inbound + core WO + one outbound`. |
| **After Phase 2 complete** | Push with message e.g. `TGND Phase 2 complete: service types + Report Center + more channels`. |
| **After Phase 3 complete** | Push with message e.g. `TGND Phase 3 complete: AI layer and automation`. |
| **After Phase 4 complete** | Final push: `TGND Phase 4 complete: production deployment`. |

---

## 3. How to Push

1. **Repo:** Use the owner’s GitHub repo (URL from owner or from `SITE_GITHUB_ORG` / `SITE_GITHUB_PERSONAL` in `.env`; do not commit these if they contain secrets).
2. **Auth:** Use `GITHUB_TOKEN` or `GITHUB_MODEL_TOKEN` from `.env` for push (e.g. HTTPS with token, or SSH key already configured). Do not commit tokens.
3. **Commands (from repo root):**
   - `git status` – confirm no `.env` or secrets staged.
   - `git add .` (or specific paths); ensure `.gitignore` is respected.
   - `git commit -m "TGND: <phase or milestone description>"`
   - `git push origin main` (or the default branch name).

---

## 4. Who Runs It

- **Jordan** is the primary executor for server and GitHub sync.
- **Archie** may perform the push if Jordan is unavailable and the plan assigns that to the Project Director.
- The owner should not need to run git commands; only provide credentials or repo access if blocked.

---

*Update this doc if the repo URL, branch strategy, or CI (e.g. GitHub Actions) changes.*
