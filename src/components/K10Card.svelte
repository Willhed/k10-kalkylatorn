<script>
  import { formatSEK, formatPercent } from '../lib/formatters.js';
  import { UTDELNINGSAR, IBB_AR } from '../lib/constants.js';
  import { handleBlur, handleFocus, handleKeydown } from '../lib/numberInput.js';
  import { beraknaK10, normaliseraPersonnummer, normaliseraOrgnr, skapaBlanketterSru, tillLatin1 } from '../lib/k10.js';

  // Omkostnadsbelopp och övriga bolag hämtas från panelen. Ägarandel, lönesumma och sparat
  // utrymme har egna fält, eftersom K10 kräver de faktiska värdena per 1 januari, föregående år
  // respektive förra årets K10, medan panelen är till för att pröva scenarier. Personuppgifterna här sparas inte i den
  // delbara länken och lämnar aldrig webbläsaren.
  let { agarandel = $bindable(), totalLonesumma, sparatUtrymme: panelSparat, omkostnadsbelopp, ovrigaAgarandelar } = $props();

  let personnummer = $state('');
  let namn = $state('');
  let orgnr = $state('');
  let aktierAgda = $state(0);
  let aktierTotalt = $state(0);
  let lonesumma = $state(0);
  let sparatUtrymme = $state(0);
  let egenLon = $state(0);
  let utdelning = $state(0);
  let bekraftat = $state(false);
  // Vilka fälts förklaringar som är öppna
  let hjalp = $state({});

  // För över panelens värden när användaren har fyllt i sina faktiska siffror där.
  // Ägarandelen kan inte föras över: K10 kräver antalet aktier.
  let hamtat = $state(false);
  function hamtaFranPanelen() {
    lonesumma = totalLonesumma;
    sparatUtrymme = panelSparat;
    hamtat = true;
  }

  const formatAntal = (n) => (n > 0 ? new Intl.NumberFormat('sv-SE').format(n) : '');

  let pnr = $derived(normaliseraPersonnummer(personnummer));
  let org = $derived(normaliseraOrgnr(orgnr));
  let aktierOk = $derived(aktierAgda > 0 && aktierTotalt >= aktierAgda);

  let k10 = $derived(
    aktierOk
      ? beraknaK10({
          aktierAgda,
          aktierTotalt,
          lonesumma,
          egenLon,
          omkostnadsbelopp,
          sparatUtrymme,
          utdelning,
          ovrigaAgarandelar,
        })
      : null
  );

  // Ägarandel i procent med två decimaler, som panelen
  let andelProcent = $derived(k10 ? Math.round(k10.andel * 10_000) / 100 : null);
  let andelSkiljer = $derived(andelProcent !== null && Math.abs(agarandel - andelProcent) >= 0.01);

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
    Fyll i det som g&auml;llde 1 januari {UTDELNINGSAR} och under {IBB_AR}, s&aring; f&aring;r du
    K10:ans rutor och en fil att importera i Skatteverkets e-tj&auml;nst. G&auml;ller direkt
    &auml;gande.
  </p>
</section>

<div class="card k10-card">
  <div class="scope">
    <p>Verktyget t&auml;cker bara det enkla fallet. Det st&auml;mmer f&ouml;r dig om:</p>
    <ul>
      <li>bolaget &auml;r svenskt och saknar dotterf&ouml;retag,</li>
      <li>du &auml;gde aktierna hela {IBB_AR} och vid ing&aring;ngen av {UTDELNINGSAR},</li>
      <li>du inte s&aring;lt eller gett bort aktier under {UTDELNINGSAR},</li>
      <li>ingen make, maka eller sambo &auml;ger aktier i bolaget (sambo r&auml;knas om ni har varit gifta eller har eller har haft barn tillsammans).</li>
    </ul>
    <label class="checkbox-row">
      <input type="checkbox" bind:checked={bekraftat} />
      <span>Allt ovan st&auml;mmer f&ouml;r mig</span>
    </label>
  </div>

  <!-- Varje fält har en ?-knapp med förklaring; knapp i stället för hover så att det fungerar på mobil -->
  {#snippet rubrik(id, text, valfritt = false)}
    <div class="field-label">
      <label for="k10-{id}">{text}{#if valfritt}&nbsp;<em>(valfritt)</em>{/if}</label>
      <button
        type="button"
        class="help-btn"
        aria-expanded={!!hjalp[id]}
        aria-controls="k10-{id}-hjalp"
        aria-label="Förklaring: {text}"
        onclick={() => (hjalp[id] = !hjalp[id])}
      >?</button>
    </div>
  {/snippet}

  <div class="hamta">
    <p>
      Har du redan fyllt i panelen med dina faktiska v&auml;rden f&ouml;r {IBB_AR}?
      {#if hamtat}
        <strong>H&auml;mtat.</strong> Kontrollera f&auml;lten nedan.
      {/if}
    </p>
    <button type="button" class="hamta-btn" onclick={hamtaFranPanelen}>
      H&auml;mta l&ouml;nesumma ({formatSEK(totalLonesumma)}) och sparat utrymme ({formatSEK(panelSparat)}) fr&aring;n panelen
    </button>
  </div>

  <div class="fields">
    <div class="field">
      {@render rubrik('pnr', 'Ditt personnummer')}
      <input id="k10-pnr" type="text" inputmode="numeric" autocomplete="off" placeholder="&Aring;&Aring;&Aring;&Aring;MMDD-NNNN" bind:value={personnummer} />
      {#if hjalp.pnr}
        <p id="k10-pnr-hjalp" class="help">
          Tolv siffror, med &aring;rhundradet f&ouml;rst. Personnumret skrivs bara in i filen och
          skickas ingenstans.
        </p>
      {/if}
      {#if personnummer && !pnr}<small class="error">Ange tolv siffror, t.ex. 19800101-1234.</small>{/if}
    </div>
    <div class="field">
      {@render rubrik('namn', 'Ditt namn', true)}
      <input id="k10-namn" type="text" autocomplete="off" bind:value={namn} />
      {#if hjalp.namn}
        <p id="k10-namn-hjalp" class="help">Visas p&aring; kvittot n&auml;r du l&auml;mnar filen. P&aring;verkar inte ber&auml;kningen.</p>
      {/if}
    </div>
    <div class="field">
      {@render rubrik('orgnr', 'Bolagets organisationsnummer')}
      <input id="k10-orgnr" type="text" inputmode="numeric" autocomplete="off" placeholder="NNNNNN-NNNN" bind:value={orgnr} />
      {#if hjalp.orgnr}
        <p id="k10-orgnr-hjalp" class="help">
          Tio siffror f&ouml;r bolaget vars aktier K10:an g&auml;ller. Finns p&aring; registreringsbeviset
          och i bolagets årsredovisning.
        </p>
      {/if}
      {#if orgnr && !org}<small class="error">Kontrollera organisationsnumret.</small>{/if}
    </div>
    <div class="field">
      {@render rubrik('agda', `Aktier du ägde 1 januari ${UTDELNINGSAR}`)}
      <input
        id="k10-agda"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatAntal(aktierAgda)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (aktierAgda = v), formatAntal)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.agda}
        <p id="k10-agda-hjalp" class="help">
          Antalet aktier, inte procent, som du sj&auml;lv &auml;gde vid &aring;rets b&ouml;rjan. Finns i
          bolagets aktiebok. Din &auml;garandel r&auml;knas fram ur antalet.
        </p>
      {/if}
    </div>
    <div class="field">
      {@render rubrik('totalt', `Totalt antal aktier i bolaget 1 januari ${UTDELNINGSAR}`)}
      <input
        id="k10-totalt"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatAntal(aktierTotalt)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (aktierTotalt = v), formatAntal)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.totalt}
        <p id="k10-totalt-hjalp" class="help">
          Alla aktier i bolaget vid &aring;rets b&ouml;rjan, oavsett vem som &auml;ger dem. Finns i
          aktieboken och p&aring; bolagets registreringsbevis fr&aring;n Bolagsverket; kontrollera att
          antalet inte har &auml;ndrats sedan 1 januari.
        </p>
      {/if}
      {#if aktierAgda > 0 && aktierTotalt > 0 && !aktierOk}<small class="error">Du kan inte &auml;ga fler aktier &auml;n bolaget har.</small>{/if}
    </div>
    <div class="field">
      {@render rubrik('lonesumma', `Bolagets kontanta löner ${IBB_AR}`)}
      <input
        id="k10-lonesumma"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(lonesumma)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (lonesumma = v), formatSEK)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.lonesumma}
        <p id="k10-lonesumma-hjalp" class="help">
          Alla anst&auml;lldas utbetalda bruttol&ouml;ner under {IBB_AR}, inklusive din egen. F&ouml;rm&aring;ner,
          kostnadsers&auml;ttningar och l&ouml;n som t&auml;cks av statliga l&ouml;nebidrag r&auml;knas inte.
          Det h&auml;r &auml;r det faktiska beloppet, inte det du provar med i panelen.
        </p>
      {/if}
    </div>
    <div class="field">
      {@render rubrik('lon', `Din och närståendes kontanta lön från bolaget ${IBB_AR}`)}
      <input
        id="k10-lon"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(egenLon)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (egenLon = v), formatSEK)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.lon}
        <div id="k10-lon-hjalp" class="help">
          <p>
            <strong>Kontant l&ouml;n</strong> &auml;r utbetald bruttol&ouml;n under {IBB_AR}, allts&aring;
            f&ouml;re skatt, inklusive bonus och semesterers&auml;ttning. F&ouml;rm&aring;ner som bil
            eller friskv&aring;rd r&auml;knas inte, och inte heller kostnadsers&auml;ttningar,
            pensionsavs&auml;ttningar, arbetsgivaravgifter eller utdelning.
          </p>
          <p>
            Ditt l&ouml;nebaserade utrymme f&aring;r vara h&ouml;gst 50 g&aring;nger summan av din och
            dina <strong>n&auml;rst&aring;endes</strong> kontanta l&ouml;n fr&aring;n bolaget. N&auml;rst&aring;ende &auml;r:
          </p>
          <ul>
            <li>make eller maka, och sambo som du har varit gift med eller har eller har haft barn med,</li>
            <li>f&ouml;r&auml;ldrar, mor- och farf&ouml;r&auml;ldrar,</li>
            <li>barn, barnbarn och deras barn i alla led, och deras makar (styv- och fosterbarn r&auml;knas som barn),</li>
            <li>syskon, syskons makar och syskons barn och barnbarn i alla led,</li>
            <li>d&ouml;dsbon d&auml;r du eller n&aring;gon av dessa &auml;r del&auml;gare.</li>
          </ul>
        </div>
      {/if}
    </div>
    <div class="field">
      {@render rubrik('utdelning', `Utdelning du fått under ${UTDELNINGSAR}`)}
      <input
        id="k10-utdelning"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(utdelning)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (utdelning = v), formatSEK)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.utdelning}
        <p id="k10-utdelning-hjalp" class="help">
          Utdelning f&ouml;re skatt som du kunde f&ouml;rfoga &ouml;ver under {UTDELNINGSAR}, det vill
          s&auml;ga som betalades ut eller fanns tillg&auml;nglig f&ouml;r dig. Oftast den som beslutades
          p&aring; &aring;rsst&auml;mman. Har du inte f&aring;tt n&aring;gon, l&aring;t den vara 0 kr;
          d&aring; sparas hela gr&auml;nsbeloppet till n&auml;sta &aring;r.
        </p>
      {/if}
    </div>
    <div class="field">
      {@render rubrik('sparat', 'Sparat utdelningsutrymme från förra årets K10')}
      <input
        id="k10-sparat"
        class="input-number"
        type="text"
        inputmode="numeric"
        value={formatSEK(sparatUtrymme)}
        onfocus={handleFocus}
        onblur={(e) => handleBlur(e, 0, Infinity, (v) => (sparatUtrymme = v), formatSEK)}
        onkeydown={handleKeydown}
      />
      {#if hjalp.sparat}
        <p id="k10-sparat-hjalp" class="help">
          St&aring;r p&aring; din K10 f&ouml;r {IBB_AR} som <em>Sparat utdelningsutrymme till n&auml;sta &aring;r</em>:
          p. 1.11 om du anv&auml;nde f&ouml;renklingsregeln, p. 2.12 om du anv&auml;nde huvudregeln.
          Fick du ingen utdelning {IBB_AR} sparas hela gr&auml;nsbeloppet, p. 1.5 respektive p. 2.6.
          Har du inget sparat utrymme, l&aring;t den vara 0 kr.
        </p>
      {/if}
    </div>
  </div>

  <div class="fran-panelen">
    <p>Fr&aring;n panelen &ndash; &auml;ndra d&auml;r om det inte st&auml;mmer per 1 januari {UTDELNINGSAR}:</p>
    <dl>
      <div><dt>Omkostnadsbelopp</dt><dd>{formatSEK(omkostnadsbelopp)}</dd></div>
      <div><dt>&Ouml;vriga f&aring;mansbolag</dt><dd>{ovrigaAgarandelar.length || 'inga'}</dd></div>
    </dl>
  </div>

  {#if k10}
    <p class="andel">Din &auml;garandel enligt antalet aktier: {formatPercent(andelProcent)}</p>
    {#if andelSkiljer}
      <p class="andel-skiljer">
        Panelen r&auml;knar med {formatPercent(agarandel)}.
        {#if andelProcent >= 1}
          <button type="button" class="link-btn" onclick={() => (agarandel = andelProcent)}>
            Anv&auml;nd {formatPercent(andelProcent)} i panelen
          </button>
        {/if}
      </p>
    {/if}

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

  .field-label label {
    font-weight: 500;
  }

  .field-label em {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  /* ?-knappen följer textflödet efter sista ordet */
  .field-label .help-btn {
    margin-left: 4px;
    vertical-align: 1px;
  }

  .help {
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .help p + p,
  .help ul {
    margin-top: var(--spacing-xs);
  }

  .help ul {
    padding-left: var(--spacing-lg);
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

  .andel-skiljer {
    font-size: 0.85rem;
    margin: calc(-1 * var(--spacing-xs)) 0 var(--spacing-sm);
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: underline;
    cursor: pointer;
  }

  .hamta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm) var(--spacing-md);
    font-size: 0.85rem;
    margin-bottom: var(--spacing-lg);
  }

  .hamta-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-primary);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 4px 10px;
    text-align: left;
  }

  .hamta-btn:hover {
    border-color: var(--color-primary);
  }

  .fran-panelen {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-lg);
  }

  .fran-panelen dl {
    max-width: 420px;
    margin-top: var(--spacing-xs);
  }

  .fran-panelen dl div {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .fran-panelen dd {
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
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
