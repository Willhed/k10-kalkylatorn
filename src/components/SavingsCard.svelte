<script>
  import { formatSEK, formatPercentDecimal } from '../lib/formatters.js';
  import { KAPITALSKATT, PROGRESSIV_SKATT_APPROX } from '../lib/constants.js';

  // Förklarar varför holdingbolaget ger skattevinst. Själva besparingen i kronor
  // visas bara i break-even-kortet, där den följer användarens utdelning.
  let { direktResult, holdingResult } = $props();

  let diff = $derived(Math.abs(holdingResult.gransbelopp - direktResult.gransbelopp));
  let holdingWins = $derived(holdingResult.gransbelopp > direktResult.gransbelopp);
  let isEqual = $derived(diff < 1);

  // Holdingbolaget får alltid minst lika stort grundbelopp, så direkt ägande vinner
  // bara på lönebaserat utrymme eller ränta på omkostnadsbelopp.
  let direktSkal = $derived(
    direktResult.lonebaseratUtrymme > holdingResult.lonebaseratUtrymme
      ? 'Holdingbolaget får inte räkna med bolagets löner när det äger högst 50 % utan bestämmande inflytande, och det lönebaserade utrymmet väger tyngre än holdingbolagets högre grundbelopp. Har holdingbolaget bestämmande inflytande, t.ex. via röstmajoritet eller avtal, kryssa i det under Holdingbolag i panelen.'
      : 'Ditt omkostnadsbelopp vid direkt ägande ger mer utrymme än holdingbolagets.'
  );
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
      <p class="savings-explain">
        Den delen kan tas ut till <strong>{formatPercentDecimal(KAPITALSKATT)}</strong> skatt
        i st&auml;llet f&ouml;r ca <strong>{formatPercentDecimal(PROGRESSIV_SKATT_APPROX)}</strong>* som
        tj&auml;nsteinkomst. Hur mycket du sparar beror p&aring; hur mycket du delar ut &mdash; se nedan.
      </p>
    </div>
    <p class="approx-note">
      * En schablon. Din faktiska marginalskatt beror p&aring; din totala inkomst och din kommuns skattesats.
    </p>
  </div>
{:else}
  <div class="card savings-card direkt-wins">
    <div class="savings-item">
      <span class="savings-label">Direkt &auml;gande ger mer utdelningsutrymme</span>
      <span class="savings-amount direkt-color">+{formatSEK(diff)}</span>
      <span class="savings-detail">{direktSkal}</span>
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

  .savings-detail {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }

  .savings-explain {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .approx-note {
    margin-top: var(--spacing-md);
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
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
