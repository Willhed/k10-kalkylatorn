<script>
  import { formatSEK, formatPercent, formatPercentDecimal } from '../lib/formatters.js';
  import { IBB, RANTA_PROCENT } from '../lib/constants.js';

  let { direktResult, holdingResult } = $props();

  let savings = $derived(holdingResult.gransbelopp - direktResult.gransbelopp);
  let direktWins = $derived(direktResult.gransbelopp > holdingResult.gransbelopp);
  let diff = $derived(Math.abs(holdingResult.gransbelopp - direktResult.gransbelopp));
</script>

<div class="card table-card">
  <h2>Detaljerad ber&auml;kning</h2>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Komponent</th>
          <th class="val direkt">Direkt &auml;gande</th>
          <th class="val holding">Holdingbolag</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Grundbelopp
            <span class="formula">
              {#if direktResult.grundbeloppProportioneras || holdingResult.grundbeloppProportioneras}
                proportionerat ur 4 &times; IBB (max totalt)
              {:else}
                &auml;garandel &times; 4 &times; IBB
              {/if}
            </span>
          </td>
          <td class="val">
            {formatSEK(direktResult.grundbelopp)}
            {#if direktResult.grundbeloppProportioneras}
              <span class="prop-badge" title="Reducerat fr&aring;n {formatSEK(direktResult.rawGrundbelopp)} p.g.a. proportionering">Prop.</span>
            {/if}
          </td>
          <td class="val">
            {formatSEK(holdingResult.grundbelopp)}
            {#if holdingResult.grundbeloppProportioneras}
              <span class="prop-badge" title="Reducerat fr&aring;n {formatSEK(holdingResult.rawGrundbelopp)} p.g.a. proportionering">Prop.</span>
            {/if}
          </td>
        </tr>
        <tr>
          <td>
            L&ouml;neunderlag
            <span class="formula">andel i opco &times; total l&ouml;nesumma</span>
          </td>
          <td class="val">{formatSEK(direktResult.loneunderlag)}</td>
          {#if holdingResult.loneunderlag > 0}
            <td class="val">{formatSEK(holdingResult.loneunderlag)}</td>
          {:else}
            <td class="val na">Ej till&auml;mpligt</td>
          {/if}
        </tr>
        <tr>
          <td>
            L&ouml;neavdrag
            <span class="formula">8 &times; IBB = {formatSEK(8 * IBB)}</span>
          </td>
          <td class="val negative">&minus;{formatSEK(direktResult.loneavdrag)}</td>
          {#if holdingResult.loneunderlag > 0}
            <td class="val negative">&minus;{formatSEK(holdingResult.loneavdrag)}</td>
          {:else}
            <td class="val na">&mdash;</td>
          {/if}
        </tr>
        <tr>
          <td>
            L&ouml;nebaserat utrymme
            <span class="formula">max(0, underlag &minus; avdrag) &times; 50 %</span>
          </td>
          <td class="val">{formatSEK(direktResult.lonebaseratUtrymme)}</td>
          <td class="val">{formatSEK(holdingResult.lonebaseratUtrymme)}</td>
        </tr>
        {#if direktResult.capApplied || holdingResult.capApplied}
          <tr class="cap-row">
            <td>
              50&times;-tak
              <span class="formula">50 &times; egen l&ouml;n</span>
            </td>
            <td class="val" class:cap-hit={direktResult.capApplied}>
              {#if direktResult.capApplied}
                {formatSEK(direktResult.lonebaseratCap)}
                <span class="cap-badge">Tak!</span>
              {:else}
                &mdash;
              {/if}
            </td>
            <td class="val" class:cap-hit={holdingResult.capApplied}>
              {#if holdingResult.capApplied}
                {formatSEK(holdingResult.lonebaseratCap)}
                <span class="cap-badge">Tak!</span>
              {:else}
                &mdash;
              {/if}
            </td>
          </tr>
        {/if}
        <tr>
          <td>
            R&auml;nta p&aring; omkostnadsbelopp
            <span class="formula">(belopp &minus; 100 000) &times; {formatPercentDecimal(RANTA_PROCENT)}</span>
          </td>
          <td class="val">{formatSEK(direktResult.rantaUtrymme)}</td>
          <td class="val">{formatSEK(holdingResult.rantaUtrymme)}</td>
        </tr>
        <tr class="total-row">
          <td>Gr&auml;nsbelopp</td>
          <td class="val" class:winner={direktWins}>{formatSEK(direktResult.gransbelopp)}</td>
          <td class="val" class:winner={!direktWins && diff > 0}>{formatSEK(holdingResult.gransbelopp)}</td>
        </tr>
        {#if diff > 0}
          <tr class="savings-row">
            <td>Skillnad</td>
            {#if direktWins}
              <td class="val positive">+{formatSEK(diff)}</td>
              <td class="val"></td>
            {:else}
              <td class="val"></td>
              <td class="val positive">+{formatSEK(diff)}</td>
            {/if}
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
  <p class="table-note">
    Holdingbolaget &auml;gs till 100 % av dig. Om andelen i operativbolaget &auml;r &ouml;ver 50 %
    r&auml;knas l&ouml;ner fr&aring;n dotterbolaget in i K10-ber&auml;kningen.
  </p>
  {#if direktResult.grundbeloppProportioneras || holdingResult.grundbeloppProportioneras}
    <div class="prop-notice">
      <strong>Grundbelopp proportionerat:</strong> Du &auml;ger andelar i fler bolag &auml;n ett,
      varf&ouml;r grundbeloppet (max 4 &times; IBB totalt) f&ouml;rdelas proportionellt baserat p&aring;
      dina &auml;garandelar. Utan begr&auml;nsning hade grundbeloppet i detta scenario blivit
      {formatSEK(direktResult.rawGrundbelopp)} (direkt) resp.
      {formatSEK(holdingResult.rawGrundbelopp)} (holding).
    </div>
  {/if}
</div>

<style>
  .table-card h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead th {
    text-align: left;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 2px solid var(--color-border);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--color-text-muted);
  }

  th.direkt { color: #3b82f6; }
  th.holding { color: #10b981; }

  td {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    vertical-align: top;
  }

  .val {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .formula {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .negative {
    color: var(--color-danger);
  }

  .positive {
    color: var(--color-success);
    font-weight: 700;
  }

  .na {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .winner {
    color: var(--color-success);
    font-weight: 700;
  }

  .cap-hit {
    color: var(--color-accent);
  }

  .cap-badge {
    display: inline-block;
    background: var(--color-accent-light);
    color: #92400e;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 4px;
  }

  .cap-row td {
    background: var(--color-accent-light);
  }

  .total-row td {
    border-top: 2px solid var(--color-text);
    border-bottom: 2px solid var(--color-text);
    font-weight: 700;
    font-size: 1rem;
  }

  .savings-row td {
    background: var(--color-success-bg);
    font-weight: 600;
  }

  .table-note {
    margin-top: var(--spacing-md);
    font-size: 0.8rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .prop-badge {
    display: inline-block;
    background: #dbeafe;
    color: #1d4ed8;
    padding: 0 5px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 4px;
    cursor: help;
  }

  .prop-notice {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #1e40af;
  }
</style>
