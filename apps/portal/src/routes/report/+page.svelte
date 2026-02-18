<script>
  import { onMount } from 'svelte';
  import { fetchWorkOrders, assignWorkOrder, exportUrl } from '$lib/api.js';

  let tab = 'open';
  let workOrders = [];
  let loading = true;
  let error = '';
  let assignLoading = null;
  let filters = { status: '', provider_key: '', service_type: '' };

  async function load() {
    loading = true;
    error = '';
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.provider_key) params.provider_key = filters.provider_key;
      if (filters.service_type) params.service_type = filters.service_type;
      const data = await fetchWorkOrders(params);
      workOrders = data.work_orders || [];
    } catch (e) {
      error = e.message || 'Failed to load work orders';
      workOrders = [];
    } finally {
      loading = false;
    }
  }

  async function doAssign(id) {
    assignLoading = id;
    error = '';
    try {
      await assignWorkOrder(id);
      await load();
    } catch (e) {
      error = e.message || 'Assign failed';
    } finally {
      assignLoading = null;
    }
  }

  onMount(load);

  $: openWOs = workOrders.filter((wo) => !['completed', 'closed', 'cancelled'].includes(wo.status));
  $: assignableWOs = workOrders.filter((wo) => ['scheduling', 'parts_shipped'].includes(wo.status) && !wo.platform_job_id);
  $: completedWOs = workOrders.filter((wo) => wo.status === 'completed');
  $: withParts = workOrders.filter((wo) => (wo.parts && wo.parts.length) || (wo.completion_payload && (wo.completion_payload.return_tracking || wo.completion_payload.parts_used)));

  function tatRequestedToAssigned() {
    return workOrders.filter((w) => w.status === 'assigned' || w.platform_job_id).length;
  }
  function tatAssignedToCompleted() {
    return completedWOs.length;
  }
</script>

<div class="report">
  <h1>Report Center</h1>

  <div class="tabs">
    <button class:active={tab === 'open'} on:click={() => (tab = 'open')}>Open WOs</button>
    <button class:active={tab === 'tat'} on:click={() => (tab = 'tat')}>TAT</button>
    <button class:active={tab === 'tech'} on:click={() => (tab = 'tech')}>Tech assign</button>
    <button class:active={tab === 'parts'} on:click={() => (tab = 'parts')}>Parts return</button>
  </div>

  <div class="filters">
    <label>Status <input type="text" bind:value={filters.status} placeholder="e.g. received" /></label>
    <label>Provider <input type="text" bind:value={filters.provider_key} placeholder="provider_key" /></label>
    <label>Service type <input type="text" bind:value={filters.service_type} placeholder="e.g. osr" /></label>
    <button on:click={() => load()}>Apply</button>
  </div>

  {#if error}<p class="error">{error}</p>{/if}

  {#if tab === 'open'}
    <section>
      <h2>Open work orders</h2>
      {#if loading}<p>Loading…</p>
      {:else}
        <p>{openWOs.length} open</p>
        <table>
          <thead><tr><th>ID</th><th>External ID</th><th>Provider</th><th>Status</th><th>Service type</th><th>Appointment</th></tr></thead>
          <tbody>
            {#each openWOs as wo}
              <tr>
                <td><a href="/report/wo/{wo.id}">{wo.id?.slice(0, 8)}…</a></td>
                <td>{wo.external_id}</td>
                <td>{wo.provider_key}</td>
                <td>{wo.status}</td>
                <td>{wo.service_type}</td>
                <td>{wo.appointment_date ? new Date(wo.appointment_date).toLocaleDateString() : '—'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
  {:else if tab === 'tat'}
    <section>
      <h2>TAT metrics</h2>
      {#if loading}<p>Loading…</p>
      {:else}
        <p>Requested → assigned (count): {tatRequestedToAssigned()}</p>
        <p>Assigned → completed (count): {tatAssignedToCompleted()}</p>
      {/if}
    </section>
  {:else if tab === 'tech'}
    <section>
      <h2>Tech assign</h2>
      <p>WOs in scheduling/parts_shipped ready to assign.</p>
      {#if loading}<p>Loading…</p>
      {:else}
        <table>
          <thead><tr><th>ID</th><th>External ID</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {#each assignableWOs as wo}
              <tr>
                <td>{wo.id?.slice(0, 8)}…</td>
                <td>{wo.external_id}</td>
                <td>{wo.status}</td>
                <td>
                  <button disabled={assignLoading === wo.id} on:click={() => doAssign(wo.id)}>
                    {assignLoading === wo.id ? 'Assigning…' : 'Assign'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if assignableWOs.length === 0}<p>No WOs ready to assign.</p>{/if}
      {/if}
    </section>
  {:else if tab === 'parts'}
    <section>
      <h2>Parts return</h2>
      {#if loading}<p>Loading…</p>
      {:else}
        <table>
          <thead><tr><th>ID</th><th>External ID</th><th>Status</th><th>Parts / return</th></tr></thead>
          <tbody>
            {#each withParts as wo}
              <tr>
                <td>{wo.id?.slice(0, 8)}…</td>
                <td>{wo.external_id}</td>
                <td>{wo.status}</td>
                <td>{wo.parts?.length ? `${wo.parts.length} part(s)` : ''} {wo.completion_payload?.return_tracking ? `Return: ${wo.completion_payload.return_tracking}` : ''}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if withParts.length === 0}<p>No WOs with parts/return data.</p>{/if}
      {/if}
    </section>
  {/if}

  <section class="export">
    <h2>Export</h2>
    <a href={exportUrl(filters)} download="work-orders-export.csv">Download CSV</a>
  </section>
</div>

<style>
  .report { max-width: 1200px; }
  .tabs { margin: 1rem 0; }
  .tabs button { margin-right: 0.5rem; padding: 0.4rem 0.8rem; cursor: pointer; border: 1px solid #ccc; background: #f5f5f5; border-radius: 4px; }
  .tabs button.active { background: #0f3460; color: #fff; border-color: #0f3460; }
  .filters { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
  .filters label { display: flex; align-items: center; gap: 0.3rem; }
  .filters input { width: 120px; }
  .error { color: #c00; }
  table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
  th, td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; text-align: left; }
  th { background: #f0f0f0; }
  a { color: #0f3460; }
  .export { margin-top: 2rem; }
</style>
