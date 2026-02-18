# TGND Advanced File Version Tracking System

**Project:** Geeks Next Door (TGND)  
**Purpose:** Uniform, project-specific naming for versioned artifacts with version and timestamp.

---

## 1. Naming Convention

All versioned project artifacts (design docs, config snapshots, generated reports, critical code snapshots) MUST follow:

```
{basename}.v{MAJOR}.{MINOR}.{PATCH}.{YYYYMMDD}.{HHmmss}.{ext}
```

Or the short form when patch is zero and time is not required:

```
{basename}.v{MAJOR}.{MINOR}.{YYYYMMDD}.{ext}
```

**Examples:**

- `PROJECT_PLAN_MILESTONES_AND_AGENTS.v1.0.0.20260217.143022.md`
- `work_order_schema.v2.1.0.20260217.json`
- `CHECKLIST.v1.0.20260217.md`

**Rules:**

- **basename:** Lowercase, words separated by underscores; no spaces.
- **version:** Semantic-style MAJOR.MINOR.PATCH (e.g. 1.0.0). MAJOR = breaking change, MINOR = new feature, PATCH = fix only.
- **date:** YYYYMMDD (UTC preferred).
- **time:** HHmmss (24h, UTC preferred) when same-day revisions matter.
- **ext:** Original file extension.

---

## 2. What to Version

- Design/scope docs when meaningfully updated (e.g. PROJECT_PLAN, DESIGN_SCOPE).
- Schema/config snapshots (canonical WO schema, provider config).
- Report Center exports or generated reports that are kept as artifacts.
- Critical one-off scripts or migration helpers that are not in normal VCS flow (optional).

**Do not** use this for every source file; normal Git history is the source of truth for code. Use this for **named deliverables** and **snapshots** that need a clear, sortable identity outside Git.

---

## 3. Where to Store Versioned Copies

- **Docs:** `docs/versions/` (e.g. `docs/versions/PROJECT_PLAN_MILESTONES_AND_AGENTS.v1.0.0.20260217.143022.md`).
- **Config/schema snapshots:** `config/versions/` or `db/schema_versions/` (project choice).
- **Generated reports:** `logs/reports/` or `apps/portal/export/versions/` (define in app).

---

## 4. Tooling

- **Script:** `tools/versioning/tgnd_version_copy.sh` – copies a file into the appropriate versions directory with the next version or a given version/timestamp.
- **Config:** `tools/versioning/config.json` – maps path prefixes to version output directories and default version rules.
- **Readme:** `tools/versioning/README.md` – usage and examples.

Agents and scripts MUST use this convention when creating versioned artifacts so the project stays uniform.
