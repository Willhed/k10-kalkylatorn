<script>
  import { formatSEK, formatPercentDecimal } from '../lib/formatters.js';
  import { KAPITALSKATT, PROGRESSIV_SKATT_APPROX } from '../lib/constants.js';

  let { direktResult, holdingResult } = $props();

  let diff = $derived(Math.abs(holdingResult.gransbelopp - direktResult.gransbelopp));
  let holdingWins = $derived(holdingResult.gransbelopp > direktResult.gransbelopp);
  let direktWins = $derived(direktResult.gransbelopp > holdingResult.gransbelopp);
  let isEqual = $derived(diff < 1);

  // Potentiell skattebesparing: skillnaden × (progressiv skatt - kapitalskatt)
  let taxSavings = $derived(diff * (PROGRESSIV_SKATT_APPROX - KAPITALSKATT));
</script>

{#if isEqual}
  <div class="card savings-card equal">
    <p class="equal-text">
      Direkt &auml;gande och holdingbolag ger samma gr&auml;nsbelopp med dessa parametrar.
    </p>
  </div>
{:else if holdingWins}
  <div class="card savings-card holding-wins">
    <div class="savings-grid">
      <div class="savings-item">
        <span class="savings-label">Holdingbolag ger mer utdelningsutrymme</span>
        <span class="savings-amount positive">+{formatSEK(diff)}</span>
      </div>
      <div class="savings-divider"></div>
      <div class="savings-item">
        <span class="savings-label">Potentiell skattebesparing</span>
        <span class="savings-amount highlight">~{formatSEK(taxSavings)}</span>
        <span class="savings-detail">
          Om skillnaden tas som utdelning
          ({formatPercentDecimal(PROGRESSIV_SKATT_APPROX)} &rarr; {formatPercentDecimal(KAPITALSKATT)})
        </span>
      </div>
    </div>
  </div>
{:else}
  <div class="card savings-card direkt-wins">
    <div class="savings-grid">
      <div class="savings-item">
        <span class="savings-label">Direkt &auml;gande ger mer utdelningsutrymme</span>
        <span class="savings-amount direkt-color">+{formatSEK(diff)}</span>
        <span class="savings-detail">
          L&ouml;neunderlaget i det operativa bolaget &ouml;verv&auml;ger holdingbolagets h&ouml;gre grundbelopp.
        </span>
      </div>
      <div class="savings-divider direkt-divider"></div>
      <div class="savings-item">
        <span class="savings-label">Potentiell skattebesparing vid direkt &auml;gande</span>
        <span class="savings-amount highlight">~{formatSEK(taxSavings)}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .savings-card {
    border-radius: var(--border-radius);
  }

  .savings-card.holding-wins {
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
    border-color: #86efac;
  }

  .savings-card.direkt-wins {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #93c5fd;
  }

  .savings-card.equal {
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  .savings-grid {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }

  .savings-divider {
    width: 1px;
    height: 60px;
    background: #86efac;
    flex-shrink: 0;
  }

  .savings-divider.direkt-divider {
    background: #93c5fd;
  }

  .savings-item {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .savings-label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  .savings-amount {
    font-size: 1.6rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .savings-amount.positive {
    color: var(--color-success);
  }

  .savings-amount.direkt-color {
    color: var(--color-primary-light);
  }

  .savings-amount.highlight {
    color: var(--color-primary);
  }

  .savings-detail {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }

  .equal-text {
    text-align: center;
    color: var(--color-text-muted);
    font-style: italic;
  }

  @media (max-width: 768px) {
    .savings-grid {
      flex-direction: column;
      text-align: center;
    }

    .savings-divider {
      width: 80%;
      height: 1px;
    }
  }
</style>
