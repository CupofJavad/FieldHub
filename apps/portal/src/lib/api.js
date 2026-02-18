/**
 * TGND Portal – API client for Report Center.
 * Uses /api proxy in dev (vite.config) or VITE_API_URL in production.
 */

const getBase = () => {
  if (typeof window === 'undefined') return '';
  return import.meta.env?.VITE_API_URL || '/api';
};

export async function fetchWorkOrders(filters = {}) {
  const base = getBase();
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.provider_key) params.set('provider_key', filters.provider_key);
  if (filters.service_type) params.set('service_type', filters.service_type);
  const qs = params.toString();
  const url = qs ? `${base}/v1/work-orders?${qs}` : `${base}/v1/work-orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchWorkOrder(id) {
  const base = getBase();
  const res = await fetch(`${base}/v1/work-orders/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function assignWorkOrder(id) {
  const base = getBase();
  const res = await fetch(`${base}/v1/work-orders/${id}/assign`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function exportUrl(filters = {}) {
  const base = getBase();
  const params = new URLSearchParams({ format: 'csv' });
  if (filters.provider_key) params.set('provider_key', filters.provider_key);
  if (filters.status) params.set('status', filters.status);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  return `${base}/v1/work-orders/export?${params.toString()}`;
}
