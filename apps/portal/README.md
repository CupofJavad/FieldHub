# TGND Portal – Report Center

Operator-facing Report Center (M2.2): open WOs, TAT, tech assign, parts return. Export CSV (M2.5).

## Run

- **Dev:** From repo root, ensure API is running (`cd apps/api && node src/server.js`). Then:
  ```bash
  cd apps/portal && npm install && npm run dev
  ```
  Portal runs at http://localhost:5174 and proxies `/api` to the API (default http://localhost:3000).

- **API URL:** Set `VITE_API_URL` (e.g. `http://localhost:3000`) if not using the dev proxy.

## Auth

Placeholder: "Log in (placeholder)" sets a session flag. Replace with real auth (API key header or session) when required.

## Report Center views

1. **Open WOs** – List open work orders; filter by status, provider, service type; link to WO detail.
2. **TAT** – Counts: requested → assigned, assigned → completed.
3. **Tech assign** – WOs in scheduling/parts_shipped; "Assign" calls `POST /v1/work-orders/:id/assign`.
4. **Parts return** – WOs with parts or return tracking.
5. **Export** – Download CSV (uses `GET /v1/work-orders/export?format=csv`).
