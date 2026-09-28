<script>
  import { formatSEK } from '../lib/formatters.js';
  import { IBB_AR, KAPITALSKATT } from '../lib/constants.js';

  let { direktResult, sparatUtrymme } = $props();

  // Gränsbeloppet beräknas på föregående års IBB, så det gäller utdelning året efter
  const utdelningsar = IBB_AR + 1;
  let totalt = $derived(direktResult.gransbelopp + sparatUtrymme);
</script>

<div class="card utrymme-card">
  <h2><span class="step">Steg 1</span> Ditt utdelningsutrymme</h2>

  <div class="hero">
    <span class="hero-amount">{formatSEK(totalt)}</span>
    <span class="hero-label">
      kan tas ut som utdelning till 20&nbsp;% skatt {utdelningsar}, vid direkt &auml;gande
    </span>
  </div>

  <dl class="ledger">
    <div class="row">
      <dt>
        Grundbelopp
        {#if direktResult.grundbeloppProportioneras}
          <span class="tag" title="Grundbeloppet delas med dina övriga fåmansbolag">proportionerat</span>
        {/if}
      </dt>
      <dd>{formatSEK(direktResult.grundbelopp)}</dd>
    </div>
    <div class="row">
      <dt>
        L&ouml;nebaserat utrymme
        {#if direktResult.capApplied}
          <span class="tag" title="Begränsat till 50 × ägarens lön">50&times;-tak</span>
        {/if}
      </dt>
      <dd>{formatSEK(direktResult.lonebaseratUtrymme)}</dd>
    </div>
    <div class="row">
      <dt>R&auml;nta p&aring; omkostnadsbelopp</dt>
      <dd>{formatSEK(direktResult.rantaUtrymme)}</dd>
    </div>
    {#if sparatUtrymme > 0}
      <div class="row">
        <dt>Sparat utdelningsutrymme</dt>
        <dd>{formatSEK(sparatUtrymme)}</dd>
      </div>
    {/if}
    <div class="row total">
      <dt>Totalt</dt>
      <dd>{formatSEK(totalt)}</dd>
    </div>
  </dl>

  <p class="explanation">
    Tar du ut hela utrymmet blir skatten {formatSEK(totalt * KAPITALSKATT)}.
    Utdelning d&auml;r&ouml;ver beskattas som tj&auml;nsteinkomst, ca 50&nbsp;%.
    Det du inte tar ut sparas till n&auml;sta &aring;r.
  </p>
</div>

<style>
  .utrymme-card h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }

  .step {
    display: inline-block;
    background: var(--color-primary);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 999px;
    margin-right: var(--spacing-xs);
    vertical-align: middle;
  }

  .hero {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-md);
  }

  .hero-amount {
    font-size: 2.2rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
  }

  .hero-label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }

  .ledger {
    max-width: 420px;
    margin-bottom: var(--spacing-md);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-xs) 0;
    font-size: 0.9rem;
  }

  .row dd {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .row.total {
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-sm);
    font-weight: 700;
  }

  .tag {
    display: inline-block;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0 6px;
    border-radius: 4px;
    margin-left: 4px;
    cursor: help;
  }

  .explanation {
    font-size: 0.9rem;
    color: var(--color-text);
  }
</style>
