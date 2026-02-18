# TGND Database

- **Migrations:** `db/migrations/` – run in order (e.g. `00001_initial_schema.sql`).
- **Seeds:** `db/seeds/` – optional dev/test data.
- **Connection:** Use `DATABASE_URL` in `.env` (never commit). Example: `postgresql://user:pass@localhost:5432/tgnd`.

Run migrations manually or via a script (e.g. `psql $DATABASE_URL -f db/migrations/00001_initial_schema.sql`).
