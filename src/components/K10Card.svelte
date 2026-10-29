<script>
  import { formatSEK, formatPercent } from '../lib/formatters.js';
  import { UTDELNINGSAR, IBB_AR } from '../lib/constants.js';
  import { handleBlur, handleFocus, handleKeydown } from '../lib/numberInput.js';
  import { beraknaK10, normaliseraPersonnummer, normaliseraOrgnr, skapaBlanketterSru, tillLatin1 } from '../lib/k10.js';

  // Lönesumma, omkostnadsbelopp, sparat utrymme och övriga bolag hämtas från panelen.
  // Personuppgifterna här sparas inte i den delbara länken och lämnar aldrig webbläsaren.
  let { totalLonesumma, omkostnadsbelopp, sparatUtrymme, ovrigaAgarandelar } = $props();

  let personnummer = $state('');
  let namn = $state('');
  let orgnr = $state('');
  let aktierAgda = $state(0);
  let aktierTotalt = $state(0);
  let egenLon = $state(0);
  let utdelning = $state(0);
  let bekraftat = $state(false);

  const formatAntal = (n) => (n > 0 ? new Intl.NumberFormat('sv-SE').format(n) : '');

  let pnr = $derived(normaliseraPersonnummer(personnummer));
  let org = $derived(normaliseraOrgnr(orgnr));
  let aktierOk = $derived(aktierAgda > 0 && aktierTotalt >= aktierAgda);

  let k10 = $derived(
    aktierOk
      ? beraknaK10({
          aktierAgda,
          aktierTotalt,
          lonesumma: totalLonesumma,
          egenLon,
          omkostnadsbelopp,
          sparatUtrymme,
          utdelning,
          ovrigaAgarandelar,
        })
      : null
  );

  const AVSNITT = { A: 'A. Gränsbelopp', B: 'B. Utdelning', D: 'D. Lönebaserat utrymme' };
  let avsnitt = $derived(
    k10 ? Object.keys(AVSNITT).filter((a) => k10.rutor.some((r) => r.avsnitt === a)) : []
  );

  let kanLaddaNer = $derived(k10 && pnr && org && bekraftat);

  function laddaNer() {
    const sru = skapaBlanketterSru({ personnummer: pnr, namn, orgnr: org, aktierAgda, aktierTotalt, rutor: k10.rutor });
    const url = URL.createObjectURL(new Blob([tillLatin1(sru)], { type: 'text/plain;charset=iso-8859-1' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BLANKETTER.SRU';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="step-three" id="k10">
  <h2><span class="step">Steg 3</span> Skapa din K10 f&ouml;r inkomst&aring;r {UTDELNINGSAR}</h2>
  <p class="step-intro">
    Fyll i det som saknas, s&aring; f&aring;r du K10:ans rutor och en fil att importera i
    Skatteverkets e-tj&auml;nst. G&auml;ller direkt &auml;gande; l&ouml;nesumma,
    omkostnadsbelopp och sparat utrymme h&auml;mtas fr&aring;n panelen.
  </p>
</section>

<div class="card k10-card">
  <div class="scope">
    <p>Verktyget t&auml;cker bara det enkla fallet. Det st&auml;mmer f&ouml;r dig om:</p>
    <ul>
      <li>bolaget &auml;r svenskt och saknar dotterf&ouml;retag,</li>
      <li>du &auml;gde aktierna hela {IBB_AR} och vid ing&aring;ngen av {UTDELNINGSAR},</li>
      <li>du inte s&aring;lt eller gett bort aktier under {UTDELNINGSAR},</li>
      <li>ingen make eller maka &auml;ger aktier i bolaget.</li>
    </ul>
    <label class="checkbox-row">
      <input type="checkbox" bind:checked={bekraftat} />
      <span>Allt ovan st&auml;mmer f&ouml;r mig</span>
    </label>
  </div>

  <div class="fields">
    <label class="field">
      <span>Ditt personnummer</span>
      <input type="text" inputmode="numeric" autocomplete="off" placeholder="&Aring;&Aring;&Aring;&Aring;MMDD-NNNN" bind:value={personnummer} />
      {#if personnummer && !pnr}<small class="error">Ange tolv siffror, t.ex. 19800101-1234.</small>{/if}
    </label>
    <label class="field">
      <span>Ditt namn <em>(valfritt)</em></span>
      <input type="text" autocomplete="off" bind:value={namn} />
    </label>
    <label class="field">
      <span>Bolagets organisationsnummer</span>
      <input type="text" inputmode="numeric" autocomplete="off" placeholder="NNNNNN-NNNN" bind:value={orgnr} />
      {#if orgnr && !org}<small class="error">Kontrollera organisationsnumret.</small>{/if}
    </label>
    <label class="field">
      <span>Aktier du &auml;gde 1 januari {UTDELNINGSAR}</span>
      <input
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatAntal(aktierAgda)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (aktierAgda = v), formatAntal)}
        onkeydown={handleKeydown}
      />
    </label>
    <label class="field">
      <span>Totalt antal aktier i bolaget 1 januari {UTDELNINGSAR}</span>
      <input
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatAntal(aktierTotalt)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (aktierTotalt = v), formatAntal)}
        onkeydown={handleKeydown}
      />
      {#if aktierAgda > 0 && aktierTotalt > 0 && !aktierOk}<small class="error">Du kan inte &auml;ga fler aktier &auml;n bolaget har.</small>{/if}
    </label>
    <label class="field">
      <span>Din kontanta l&ouml;n fr&aring;n bolaget {IBB_AR}</span>
      <input
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(egenLon)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (egenLon = v), formatSEK)}
        onkeydown={handleKeydown}
      />
      <small>Inklusive n&auml;rst&aring;endes. Begr&auml;nsar det l&ouml;nebaserade utrymmet till 50 &times; l&ouml;nen.</small>
    </label>
    <label class="field">
      <span>Utdelning du f&aring;tt under {UTDELNINGSAR}</span>
      <input
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(utdelning)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (utdelning = v), formatSEK)}
        onkeydown={handleKeydown}
      />
    </label>
  </div>

  {#if k10}
    <p class="andel">Din &auml;garandel: {formatPercent(Math.round(k10.andel * 10_000) / 100)}</p>

    <div class="table-wrapper">
      <table>
        {#each avsnitt as a}
          <tbody>
            <tr class="avsnitt"><th colspan="3" scope="colgroup">{AVSNITT[a]}</th></tr>
            {#each k10.rutor.filter((r) => r.avsnitt === a) as r}
              <tr class:total={r.punkt === '1.6' || r.punkt === '2.10'}>
                <td class="punkt">{r.punkt}</td>
                <td>{r.text}</td>
                <td class="val">{formatSEK(r.belopp)}</td>
              </tr>
            {/each}
          </tbody>
        {/each}
      </table>
    </div>

    {#if k10.lonebaseratBegransat}
      <p class="note">Det l&ouml;nebaserade utrymmet i p. 1.2 &auml;r begr&auml;nsat till 50 &times; din l&ouml;n.</p>
    {/if}

    <dl class="summary">
      {#if utdelning > 0}
        <div><dt>Till Inkomstdeklaration 1, p. 1.7 (tj&auml;nst)</dt><dd>{formatSEK(k10.tjanst)}</dd></div>
        <div><dt>Till Inkomstdeklaration 1, p. 7.2 (kapital)</dt><dd>{formatSEK(k10.kapital)}</dd></div>
      {/if}
      <div><dt>Sparat utdelningsutrymme till n&auml;sta &aring;r</dt><dd>{formatSEK(k10.sparatTillNastaAr)}</dd></div>
    </dl>

    <button type="button" class="download-btn" disabled={!kanLaddaNer} onclick={laddaNer} data-umami-event="Ladda ner K10">
      Ladda ner K10 som SRU-fil
    </button>
    {#if !kanLaddaNer}
      <p class="note">Fyll i personnummer och organisationsnummer och bekr&auml;fta att ditt fall st&auml;mmer.</p>
    {/if}

    <p class="howto">
      Importera filen i e-tj&auml;nsten Inkomstdeklaration 1 n&auml;r den &ouml;ppnar v&aring;ren {UTDELNINGSAR + 1}:
      fliken <em>Bilagor</em>, <em>Importera</em> vid K10. Kontrollera alltid uppgifterna i e-tj&auml;nsten
      innan du skriver under &ndash; du ansvarar sj&auml;lv f&ouml;r din deklaration. Filen skapas i din
      webbl&auml;sare; personnumret skickas ingenstans och sparas inte i l&auml;nken.
    </p>
  {:else}
    <p class="note">Ange antalet aktier f&ouml;r att se din K10.</p>
  {/if}
</div>

<style>
  .step-three {
    margin: var(--spacing-2xl) 0 var(--spacing-md);
  }

  .step-three h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
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

  .step-intro {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .scope {
    background: var(--color-primary-bg);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-md);
    font-size: 0.85rem;
    margin-bottom: var(--spacing-lg);
  }

  .scope ul {
    margin: var(--spacing-xs) 0 var(--spacing-sm) var(--spacing-lg);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .checkbox-row input {
    accent-color: var(--color-primary);
    width: 16px;
    height: 16px;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: var(--spacing-md) var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .field em {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .field input[type="text"]:not(.input-number) {
    font-family: inherit;
    font-size: 1rem;
    padding: 4px 8px;
    border: 1.5px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
  }

  .field input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  /* Beloppsfälten står under etiketten här, inte bredvid */
  .field .input-number {
    text-align: left;
    width: 100%;
    max-width: none;
    border-color: var(--color-border);
  }

  .field small {
    font-size: 0.78rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .field small.error {
    color: var(--color-danger);
  }

  .andel {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-sm);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  td {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .avsnitt th {
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    padding: var(--spacing-md) var(--spacing-sm) var(--spacing-xs);
  }

  .punkt {
    width: 3.5em;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .val {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  tr.total td {
    font-weight: 700;
  }

  .summary {
    margin: var(--spacing-lg) 0;
    max-width: 480px;
  }

  .summary div {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    font-size: 0.9rem;
    padding: var(--spacing-xs) 0;
  }

  .summary dd {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .download-btn {
    background: var(--color-primary);
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    padding: var(--spacing-sm) var(--spacing-lg);
    cursor: pointer;
  }

  .download-btn:disabled {
    background: var(--color-border);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  .note {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-sm);
  }

  .howto {
    font-size: 0.85rem;
    margin-top: var(--spacing-lg);
  }
</style>
