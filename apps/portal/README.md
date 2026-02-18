# TGND Portal – Report Center

Operator-facing Report Center (M2.2): open WOs, TAT, tech assign, parts return. Export CSV (M2.5).

## Run (static – no build)

- **API** must be running: `cd apps/api && node src/server.js` (default http://localhost:3000).
- **Static Report Center:** Serve `static/` and point the page at the API:
  ```bash
  cd apps/portal && npx serve static -p 5174
  ```
  Open http://localhost:5174. By default the script uses `/api` when port is 5174 (same-origin); if the API is on another port, either proxy `/api` to it or set `window.TGND_API_URL = 'http://localhost:3000'` before the script runs (and ensure the API allows CORS for the portal origin).

## Run (SvelteKit app – optional)

```bash
cd apps/portal && npm install --legacy-peer-deps && npm run dev
```
Portal at http://localhost:5174; Vite proxies `/api` to the API.

## Auth

Placeholder only. Replace with real auth (API key header or session) when required.

## Report Center views

1. **Open WOs** – List open work orders; filter by status, provider, service type.
2. **TAT** – Counts: requested → assigned, assigned → completed.
3. **Tech assign** – WOs in scheduling/parts_shipped; "Assign" calls `POST /v1/work-orders/:id/assign`.
4. **Parts return** – WOs with parts or return tracking.
5. **Export** – Download CSV (`GET /v1/work-orders/export?format=csv`).
