<script>
  import { page } from '$app/stores';
  import { fetchWorkOrder, assignWorkOrder } from '$lib/api.js';

  let wo = null;
  let loading = true;
  let error = '';
  let assigning = false;

  $: id = $page.params.id;

  async function load() {
    if (!id) return;
    loading = true;
    error = '';
    try {
      wo = await fetchWorkOrder(id);
    } catch (e) {
      error = e.message || 'Failed to load';
      wo = null;
    } finally {
      loading = false;
    }
  }

  async function doAssign() {
    if (!id) return;
    assigning = true;
    error = '';
    try {
      wo = await assignWorkOrder(id);
    } catch (e) {
      error = e.message || 'Assign failed';
    } finally {
      assigning = false;
    }
  }

  $: assignable = wo && ['scheduling', 'parts_shipped'].includes(wo.status) && !wo.platform_job_id;

  $: if (id) load();
</script>

<div class="wo-detail">
  <a href="/report">← Report Center</a>
  {#if loading}<p>Loading…</p>
  {:else if error}<p class="error">{error}</p>
  {:else if wo}
    <h2>Work order {wo.external_id}</h2>
    <dl>
      <dt>ID</dt><dd>{wo.id}</dd>
      <dt>Provider</dt><dd>{wo.provider_key}</dd>
      <dt>Status</dt><dd>{wo.status}</dd>
      <dt>Service type</dt><dd>{wo.service_type}</dd>
      <dt>Appointment</dt><dd>{wo.appointment_date ? new Date(wo.appointment_date).toLocaleString() : '—'}</dd>
      <dt>Platform</dt><dd>{wo.platform_type || '—'} {wo.platform_job_id || ''}</dd>
    </dl>
    {#if assignable}
      <button disabled={assigning} on:click={doAssign}>{assigning ? 'Assigning…' : 'Assign to platform'}</button>
    {/if}
  {:else}<p>Not found.</p>{/if}
</div>

<style>
  .wo-detail dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; }
  .error { color: #c00; }
</style>
