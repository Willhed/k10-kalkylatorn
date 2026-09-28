<script>
  import { formatSEK } from '../lib/formatters.js';

  let { breakEven, direktResult, holdingResult } = $props();

  let holdingGerMer = $derived(holdingResult.gransbelopp > direktResult.gransbelopp);
</script>

<div class="card breakeven-card" class:lonsamt={breakEven.lonsamt}>
  <h2>L&ouml;nar sig holdingbolaget?</h2>

  {#if breakEven.lonsamt}
    <p class="verdict">
      Ja, om du tar ut mer &auml;n <strong>{formatSEK(breakEven.breakEvenUttag)}</strong> per &aring;r.
    </p>
  {:else}
    <p class="verdict">Nej, inte p&aring; grund av utdelningsutrymmet.</p>
  {/if}

  {#if holdingGerMer}
    <dl class="ledger">
      <div class="row">
        <dt>Skattebesparing vid fullt uttag</dt>
        <dd class="positive">+{formatSEK(breakEven.maxBesparing)}</dd>
      </div>
      <div class="row">
        <dt>Holdingbolagets kostnad</dt>
        <dd class="negative">&minus;{formatSEK(breakEven.arligKostnad)}</dd>
      </div>
      <div class="row total">
        <dt>Netto per &aring;r</dt>
        <dd class:positive={breakEven.lonsamt} class:negative={!breakEven.lonsamt}>
          {breakEven.nettoVidFulltUttag >= 0 ? '+' : '−'}{formatSEK(Math.abs(breakEven.nettoVidFulltUttag))}
        </dd>
      </div>
    </dl>
    {#if breakEven.lonsamt}
      {#if breakEven.startKostnad > 0}
        <p class="payback">
          Uppstartskostnaden p&aring; {formatSEK(breakEven.startKostnad)} &auml;r intj&auml;nad efter
          ca <strong>{breakEven.aterbetalningManader} {breakEven.aterbetalningManader === 1 ? 'månad' : 'månader'}</strong>
          vid fullt uttag.
        </p>
      {/if}
      <p class="explanation">
        Upp till {formatSEK(direktResult.gransbelopp)} &auml;r skatten densamma i b&aring;da uppl&auml;ggen.
        D&auml;r&ouml;ver sparar holdingbolaget skatt tills dess gr&auml;nsbelopp p&aring;
        {formatSEK(holdingResult.gransbelopp)} &auml;r fullt utnyttjat.
      </p>
    {:else}
      <p class="explanation">
        &Auml;ven vid fullt uttag t&auml;cker skattebesparingen inte holdingbolagets kostnad.
      </p>
    {/if}
  {:else}
    <p class="explanation">
      Direkt &auml;gande ger lika mycket eller mer utdelningsutrymme i din situation,
      s&aring; holdingbolaget ger ingen skattevinst h&auml;r.
    </p>
  {/if}

  <p class="note">
    R&auml;knar bara p&aring; utdelningsutrymmet. Skatteuppskovet &mdash; att kunna &aring;terinvestera
    vinster i holdingbolaget utan privat skatt &mdash; kan g&ouml;ra ett holdingbolag l&ouml;nsamt &auml;nd&aring;.
  </p>
</div>

<style>
  .breakeven-card h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }

  .verdict {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
  }

  .lonsamt .verdict strong {
    color: var(--color-success);
  }

  .ledger {
    max-width: 420px;
    margin-bottom: var(--spacing-md);
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-xs) 0;
    font-size: 0.9rem;
  }

  .row dd {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .row.total {
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-sm);
    font-weight: 700;
  }

  .positive {
    color: var(--color-success);
  }

  .negative {
    color: var(--color-danger);
  }

  .payback {
    font-size: 0.9rem;
    background: var(--color-success-bg);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .explanation {
    font-size: 0.9rem;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  .note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }
</style>
