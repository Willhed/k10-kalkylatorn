<script>
  import { IBB, IBB_AR } from '../lib/constants.js';
  import { formatSEK } from '../lib/formatters.js';
</script>

<header class="header">
  <h1>K10-kalkylatorn</h1>
  <p class="subtitle">Nya 3:12-reglerna 2026 &mdash; J&auml;mf&ouml;r direkt &auml;gande vs holdingbolag</p>
  <span class="badge">IBB {IBB_AR}: {formatSEK(IBB)}</span>
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
</style>
