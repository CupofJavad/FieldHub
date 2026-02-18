# Build notes: Riley (Portal & Report Center)

*(Append new entries at the top. Date, milestone, what you did, decisions, issues, handoffs.)*

---

## 2026-02-18 – M2.2 Report Center + M2.5 Export

- **API (for portal/export):**
  - **List WOs:** Extended GET /v1/work-orders: when no `id` and not both `provider`+`external_id`, now returns list with optional query filters `status`, `provider_key`, `service_type`, `date_from`, `date_to`. Response shape: `{ work_orders: [...] }`. Added `listWorkOrders(filters)` in `apps/api/src/db.js`.
  - **Export:** Added GET /v1/work-orders/export?format=csv|json&provider_key=&status=&date_from=&date_to= (registered before /v1/work-orders/:id so "export" is not captured as id). CSV columns: id, external_id, provider_key, status, service_type, ship_to_address, appointment_date, platform_job_id, platform_type, completed_at (updated_at when status=completed), created_at, updated_at. Used for billing/claims download.
  - **CORS:** Added CORS middleware (Access-Control-Allow-Origin, default *; optional CORS_ORIGIN env) so portal can call API from another origin.
- **Portal (M2.2):**
  - **Static Report Center:** `apps/portal/static/index.html` – single-page Report Center: Open WOs (filter by status, provider, service_type), TAT (counts: requested→assigned, assigned→completed), Tech assign (list assignable WOs, "Assign" → POST /v1/work-orders/:id/assign), Parts return (WOs with parts or return tracking), Export link to CSV download. Uses `window.TGND_API_URL` or http://localhost:3000 when port 5174.
  - **SvelteKit app (optional):** `apps/portal/` has SvelteKit skeleton + Report Center routes (`/report`, `/report/wo/[id]`), auth placeholder in layout, `$lib/api.js` for fetchWorkOrders/assignWorkOrder/exportUrl. Install with `npm install --legacy-peer-deps` due to Svelte/vite peer deps.
- **Auth:** Placeholder only (sessionStorage flag in Svelte layout; static page has no auth). Real auth (API key or session) to be added when required.
- **Handoff:** Report Center and export are ready for operators. Excel export can be added later via a library (e.g. xlsx) if needed; CSV covers the handoff.

- **Test (this run):** Confirmed API routes load: `apps/api` has `getExport` and list via `listWorkOrders`; `npm run test` in apps/api passes (skips DB tests when DATABASE_URL unset). Static Report Center (`apps/portal/static/index.html`) implements all four views and export link. Full E2E: start API with DATABASE_URL, run `npx serve apps/portal/static -p 5174`, open http://localhost:5174 and use filters/Assign/Export.

---
