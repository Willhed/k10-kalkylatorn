<script>
  import { formatSEK } from '../lib/formatters.js';
  import { mailtoLink } from '../lib/contact.js';
  import { handleBlur, handleFocus, handleKeydown } from '../lib/numberInput.js';

  let {
    breakEven,
    direktResult,
    holdingResult,
    shareUrl,
    planeradUtdelningAktiv = $bindable(),
    planeradUtdelning = $bindable(),
  } = $props();

  let holdingGerMer = $derived(holdingResult.gransbelopp > direktResult.gransbelopp);
  let uttagText = $derived(
    breakEven.planerad
      ? `vid ${formatSEK(breakEven.uttag)} i utdelning`
      : 'vid fullt uttag av gränsbeloppet'
  );

  let mejl = $derived(
    mailtoLink(
      'Hjälp med holdingbolag',
      `Hej!\n\nEnligt K10-kalkylatorn skulle ett holdingbolag ge mig ca ${formatSEK(breakEven.netto)} netto per år ${uttagText}. Jag vill gärna ha hjälp att sätta upp det.\n\nMitt scenario: ${shareUrl}\n\n`
    )
  );
</script>

<div class="card breakeven-card" class:lonsamt={breakEven.lonsamt}>
  <h2>L&ouml;nar sig holdingbolaget?</h2>

  <div class="hero">
    <span class="hero-amount" class:positive={breakEven.lonsamt} class:negative={!breakEven.lonsamt}>
      {breakEven.netto >= 0 ? '+' : '−'}{formatSEK(Math.abs(breakEven.netto))}
    </span>
    <span class="hero-label">netto per &aring;r {uttagText}</span>
  </div>

  <div class="plan">
    <label class="plan-toggle">
      <input type="checkbox" bind:checked={planeradUtdelningAktiv} />
      <span>R&auml;kna p&aring; min planerade utdelning</span>
    </label>
    {#if planeradUtdelningAktiv}
      <div class="plan-header">
        <label for="planerad-utdelning">Planerad utdelning per &aring;r</label>
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(planeradUtdelning)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => planeradUtdelning = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
      <input
        id="planerad-utdelning"
        type="range"
        min="0"
        max="2000000"
        step="10000"
        value={Math.min(planeradUtdelning, 2000000)}
        oninput={(e) => planeradUtdelning = Number(e.target.value)}
      />
      <div class="range-labels">
        <span>0 kr</span>
        <span>1 Mkr</span>
        <span>2 Mkr</span>
      </div>
    {/if}
  </div>

  <p class="verdict">
    {#if breakEven.lonsamt && breakEven.planerad}
      Ja. Holdingbolaget l&ouml;nar sig vid uttag &ouml;ver {formatSEK(breakEven.breakEvenUttag)} per &aring;r,
      och du planerar {formatSEK(breakEven.uttag)}.
    {:else if breakEven.lonsamt}
      Ja, om du tar ut mer &auml;n {formatSEK(breakEven.breakEvenUttag)} per &aring;r.
    {:else if breakEven.breakEvenUttag !== null}
      Inte med {formatSEK(breakEven.uttag)} per &aring;r. Holdingbolaget l&ouml;nar sig f&ouml;rst
      vid uttag &ouml;ver {formatSEK(breakEven.breakEvenUttag)}.
    {:else}
      Nej, inte p&aring; grund av utdelningsutrymmet.
    {/if}
  </p>

  <dl class="ledger">
    <div class="row">
      <dt>Skattebesparing</dt>
      <dd class="positive">+{formatSEK(breakEven.besparing)}</dd>
    </div>
    <div class="row">
      <dt>Holdingbolagets kostnad</dt>
      <dd class="negative">&minus;{formatSEK(breakEven.arligKostnad)}</dd>
    </div>
  </dl>

  {#if breakEven.lonsamt && breakEven.startKostnad > 0}
    <p class="payback">
      Uppstartskostnaden p&aring; {formatSEK(breakEven.startKostnad)} &auml;r intj&auml;nad efter
      ca <strong>{breakEven.aterbetalningManader} {breakEven.aterbetalningManader === 1 ? 'månad' : 'månader'}</strong>.
    </p>
  {/if}

  <p class="explanation">
    {#if !holdingGerMer}
      Direkt &auml;gande ger lika mycket eller mer utdelningsutrymme i din situation,
      s&aring; holdingbolaget ger ingen skattevinst h&auml;r.
    {:else if breakEven.lagbeskattatExtra === 0}
      Hela utdelningen ryms redan i direkt&auml;gandets gr&auml;nsbelopp p&aring;
      {formatSEK(direktResult.gransbelopp)}, s&aring; holdingbolaget s&auml;nker inte skatten.
    {:else}
      {formatSEK(breakEven.lagbeskattatExtra)} av utdelningen beskattas med 20&nbsp;% i st&auml;llet
      f&ouml;r ca 50&nbsp;% tack vare holdingbolagets h&ouml;gre gr&auml;nsbelopp.
    {/if}
  </p>

  {#if breakEven.lonsamt}
    <div class="cta">
      <p class="cta-text">Vill du ha hj&auml;lp att s&auml;tta upp holdingbolaget?</p>
      <a href={mejl} class="btn btn-primary" data-umami-event="Mejl – break-even">Skicka mejl</a>
    </div>
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
    margin-bottom: var(--spacing-md);
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
    font-variant-numeric: tabular-nums;
  }

  .hero-label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }

  .plan {
    background: var(--color-bg);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-md);
    max-width: 420px;
  }

  .plan-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .plan-toggle input {
    accent-color: var(--color-primary);
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .plan-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
    font-size: 0.875rem;
  }

  .plan-header .input-number {
    margin-left: auto;
  }

  .verdict {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
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

  .cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    border: 1px solid var(--color-primary-light);
    background: var(--color-primary-bg);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-md);
    margin: var(--spacing-md) 0;
  }

  .cta-text {
    font-weight: 600;
    color: var(--color-primary);
  }

  .btn {
    display: inline-block;
    padding: 6px var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.15s;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }
</style>
