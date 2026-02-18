# TGND File Versioning Tools

Use the naming convention in `docs/FILE_VERSION_TRACKING_SYSTEM.md`.

**Create a versioned copy:**

```bash
# From repo root
./tools/versioning/tgnd_version_copy.sh path/to/file.md [MAJOR.MINOR.PATCH]
# If version omitted, uses 1.0.0
```

**Path mapping (must match `config.json`):**

| Input path prefix | Versioned copy directory |
|-------------------|--------------------------|
| `docs/`           | `docs/versions/`         |
| `config/`         | `config/versions/`       |
| `db/`             | `db/schema_versions/`    |
| `logs/`           | `logs/reports/`          |
| (other)           | `docs/versions/`         |

The script creates the target directory if needed (`mkdir -p`). **Required:** `config.json` in this directory (paths are relative to repo root).
