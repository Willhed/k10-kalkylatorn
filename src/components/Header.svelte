<script>
  import { IBB, IBB_AR } from '../lib/constants.js';
  import { formatSEK } from '../lib/formatters.js';
</script>

<header class="header">
  <h1>K10-kalkylatorn</h1>
  <p class="subtitle">Nya 3:12-reglerna 2026 &mdash; J&auml;mf&ouml;r direkt &auml;gande vs holdingbolag</p>
  <span class="badge">IBB {IBB_AR}: {formatSEK(IBB)}</span>
  <div class="cta-row">
    <span class="cta-label">Vill du ha personlig r&aring;dgivning?</span>
    <a
      href="https://calendly.com/filipwillhed98/30min"
      target="_blank"
      rel="noopener"
      class="btn btn-primary"
    >Boka tid</a>
    <a
      href="mailto:filipwillhed98@live.se"
      class="btn btn-secondary"
    >Skicka mejl</a>
  </div>
</header>

<style>
  .header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 1.05rem;
    margin-bottom: var(--spacing-sm);
  }

  .badge {
    display: inline-block;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .cta-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-primary-bg);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border);
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .btn {
    display: inline-block;
    padding: 6px var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
    white-space: nowrap;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .btn-secondary {
    background: #ffffff;
    color: var(--color-primary);
    border: 1px solid var(--color-primary-light);
  }
</style>
