<script>
  /** Auth placeholder: store "logged in" in sessionStorage; real auth later */
  let authenticated = false;
  if (typeof window !== 'undefined') {
    authenticated = sessionStorage.getItem('tgnd_portal_auth') === '1';
  }

  function login() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tgnd_portal_auth', '1');
      authenticated = true;
    }
  }

  function logout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tgnd_portal_auth');
      authenticated = false;
    }
  }
</script>

<div class="app">
  <header class="header">
    <a href="/" class="logo">TGND Report Center</a>
    <nav>
      <a href="/report">Report Center</a>
    </nav>
    <div class="auth">
      {#if authenticated}
        <button on:click={logout}>Log out</button>
      {:else}
        <button on:click={login}>Log in (placeholder)</button>
      {/if}
    </div>
  </header>
  <main>
    <slot />
  </main>
</div>

<style>
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .header {
    display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
    background: #1a1a2e; color: #eee; border-bottom: 1px solid #333;
  }
  .logo { font-weight: 700; text-decoration: none; color: inherit; margin-right: auto; }
  nav a { color: #aaa; text-decoration: none; margin-right: 1rem; }
  nav a:hover { color: #fff; }
  .auth button { background: #0f3460; color: #eee; border: none; padding: 0.4rem 0.8rem; cursor: pointer; border-radius: 4px; }
  .auth button:hover { background: #16213e; }
  main { flex: 1; padding: 1rem; }
</style>
