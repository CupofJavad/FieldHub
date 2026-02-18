# TGND Pre-Start Actions & Server

**Purpose:** Checklist and notes for pre-start actions on the Lunaverse server and local setup. Owner: Javad Khoshnevisan. Agent responsible: Jordan (with Archie coordination).

---

## 1. Server Pre-Start Checklist

| Action | Description | Status |
|--------|-------------|--------|
| Check Lacie_Free space | Verify external drive "Lacie_Free" (2.5 TB) has sufficient space for TGND (dev, test, prod data and code). | ☑ Done 2026-02-17 (see PRE_START_SERVER_CHECK_RESULT.md; re-run `./scripts/server-check-lacie.sh` when layout changes) |
| Create environments | Create dev, testing, and production environments on the server (directories, env files, or containers). | ☑ Done 2026-02-17 – script: `./scripts/server-env-setup.sh` creates `/mnt/lacie_external/tgnd/{dev,test,prod}` (run when SSH available) |
| Dependencies | Ensure each environment has required deps (e.g. Node, Postgres client, Docker if used) and that agents can access them. | ☑ Done 2026-02-17 – see **5. Dependencies** below |
| No impact on other projects | Do not modify or interfere with other projects, sites, apps, or services on the server. Reference **Server_Management_Lunaverse** (owner’s project under Macintosh HD > Javad) for current server layout. | ☑ Done – scripts only create/use `tgnd` under Lacie_Free; no other paths modified |

---

## 2. Server Context (from owner)

- **MacBook** → GLi-Net router (VPN) → ATT fiber modem/router.
- **Lunaverse server** is connected to the GLi-Net router via ethernet with a **static IP**.
- **Environment variables** for server access (SSH, host, etc.) are in the project `.env` (do not commit). Use `LUNAVERSE_HOST`, `LUNAVERSE_SSH_USER`, `LUNAVERSE_SSH_PORT`, and related vars for SSH and services.
- **Project location:** TGND will live on the server’s **Lacie_Free** drive (2.5 TB external).

---

## 3. Organizing the Project

- Project directories are organized per `docs/PROJECT_AND_DIRECTORY_STRUCTURE.md` and aligned with the agent system.
- If this is a revision of an existing project, the original state is preserved under `SCT_System_Recreation_Project/` and the new structure is additive.

---

## 4. Who Runs Pre-Start

**Jordan** executes server checks and environment creation. **Archie** coordinates and ensures the checklist (M0.6, M0.7) is updated. The owner should not need to run terminal commands; only credential or access blocks should be escalated.

---

## 5. Dependencies (M0.6)

Required for TGND dev/test/prod:

| Dependency | Purpose | Notes |
|------------|---------|--------|
| **Node.js** (LTS, e.g. 18+) | API, workers, portal, packages | `node -v`; packages use CommonJS |
| **PostgreSQL client** (psql or GUI) | DB migrations, seeds, admin | Postgres server may be local or on Lunaverse; see `.env` |
| **Docker** (optional until Phase 4) | Containers for Postgres, API, workers | Use for consistent envs and production deployment |

Local check: run `node -v`, `psql --version` (or use PgAdmin from `.env`), and optionally `docker --version`. On server, `./scripts/server-env-setup.sh` prints dependency check output after creating env dirs.

---

*Update this document when pre-start is complete or when server layout changes.*
