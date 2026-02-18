# TGND Pre-Start Server Check Result

**Date:** 2026-02-17  
**Checked by:** Project setup (initial run). **Jordan** confirmed and completed M0.6 (2026-02-17). Re-run: `./scripts/server-check-lacie.sh` from repo root when server layout changes.

---

## Lacie_Free (external drive)

- **Mount:** `/mnt/lacie_external` (device /dev/sda3)
- **Size:** 2.3 TB total
- **Used:** ~78 GB (4%)
- **Free:** ~2.2 TB
- **Verdict:** Sufficient space for TGND dev, test, and production environments.

---

## Server layout (from `df` and `lsblk`)

- **Root:** nvme (473.9G), LVM 100G for `/`
- **External:** 2.3T partition at `/mnt/lacie_external` (referred to as Lacie_Free in project)
- Other removable media: Sandy2_Free, Sandy3_Free (smaller)

---

## M0.6 completion (2026-02-17)

1. **Environments:** Script `scripts/server-env-setup.sh` creates `/mnt/lacie_external/tgnd/{dev,test,prod}`; run when SSH is available.
2. **Dependencies:** Documented in `docs/PRE_START_ACTIONS_AND_SERVER.md` §5 (Node LTS, Postgres client, Docker optional); server-env-setup.sh prints dependency check on run.
3. **No impact on other projects:** Scripts only create/use `tgnd` under Lacie_Free.
4. **CHECKLIST:** M0.6 marked Done in `agents/live/CHECKLIST.md`.

---

*This file is a one-time check result. Jordan should re-run checks if the server layout changes and update this doc or PRE_START_ACTIONS_AND_SERVER.md.*
