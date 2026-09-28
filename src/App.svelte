<script>
  import { beraknaGransbelopp, beraknaBreakEven } from './lib/calculations.js';
  import { IBB, LONEAVDRAG_FACTOR, LONEBASERAT_PERCENTAGE, LONEBASERAT_CAP_FACTOR } from './lib/constants.js';
  import Header from './components/Header.svelte';
  import InputPanel from './components/InputPanel.svelte';
  import ResultsTable from './components/ResultsTable.svelte';
  import UtrymmeCard from './components/UtrymmeCard.svelte';
  import MobileResultBar from './components/MobileResultBar.svelte';
  import SavingsCard from './components/SavingsCard.svelte';
  import BreakEvenCard from './components/BreakEvenCard.svelte';
  import ExplainerSection from './components/ExplainerSection.svelte';
  import Footer from './components/Footer.svelte';
  import { readState, writeState } from './lib/urlState.js';
  import { formatSEK } from './lib/formatters.js';

  // Startvärden: från delad länk om sådan finns, annars standard
  const start = readState(window.location.search);

  let agarandel = $state(start.agarandel);
  let totalLonesumma = $state(start.totalLonesumma);
  let omkostnadsbeloppDirekt = $state(start.omkostnadsbeloppDirekt);
  let sparatUtrymme = $state(start.sparatUtrymme);
  let omkostnadsbeloppHolding = $state(start.omkostnadsbeloppHolding);
  // Holdingbolagets kostnader: årlig (bokföring, årsredovisning) och engångs (uppstart)
  let holdingKostnad = $state(start.holdingKostnad);
  let holdingStartKostnad = $state(start.holdingStartKostnad);
  // Valfritt: räkna på planerad årlig utdelning i stället för fullt uttag
  let planeradUtdelningAktiv = $state(start.planeradUtdelningAktiv);
  let planeradUtdelning = $state(start.planeradUtdelning);
  // Övriga fåmansbolag: array av { namn: string, andel: number (procent) }
  let ovrigaBolag = $state(start.ovrigaBolag);
  let ovrigaAgarandelar = $derived(ovrigaBolag.map(b => b.andel / 100));
  // Override: bestämmande inflytande utan kapitalandel >50%
  let dotterbolagOverride = $state(start.dotterbolagOverride);
  let arDotterbolag = $derived(agarandel > 50 || dotterbolagOverride);

  // Beräkna minsta lön för att undvika 50×-taket
  // 50×-tak: lönebaseratCap = 50 × egenLon ≥ lönebaseratRaw
  // → egenLon ≥ lönebaseratRaw / 50
  let egenLon = $derived(
    Math.ceil(
      Math.max(0, (agarandel / 100) * totalLonesumma - LONEAVDRAG_FACTOR * IBB)
        * LONEBASERAT_PERCENTAGE / LONEBASERAT_CAP_FACTOR
    )
  );

  let direktResult = $derived(
    beraknaGransbelopp(agarandel / 100, totalLonesumma, egenLon, omkostnadsbeloppDirekt, IBB, ovrigaAgarandelar)
  );

  // Holdingbolag: du äger 100% av holding, holding äger samma andel av opco
  // Om andel > 50%: löner från opco räknas in (proportionellt)
  let holdingLonesumma = $derived(
    arDotterbolag ? (agarandel / 100) * totalLonesumma : 0
  );
  let holdingEgenLon = $derived(
    arDotterbolag ? egenLon : 0
  );
  let holdingResult = $derived(
    beraknaGransbelopp(1.0, holdingLonesumma, holdingEgenLon, omkostnadsbeloppHolding, IBB, ovrigaAgarandelar)
  );

  // Utdelningsutrymme vid direkt ägande: årets gränsbelopp plus sparat utrymme
  let utrymme = $derived(direktResult.gransbelopp + sparatUtrymme);

  // Resultatkolumnen; resultatraden på mobil döljs när den syns
  let resultatKolumn = $state();

  let breakEven = $derived(
    beraknaBreakEven(
      direktResult.gransbelopp,
      holdingResult.gransbelopp,
      holdingKostnad,
      holdingStartKostnad,
      planeradUtdelningAktiv ? planeradUtdelning : null,
    )
  );

  // Delbar länk: hela scenariot i URL:en
  let shareUrl = $derived.by(() => {
    const query = writeState({
      agarandel,
      totalLonesumma,
      omkostnadsbeloppDirekt,
      sparatUtrymme,
      omkostnadsbeloppHolding,
      holdingKostnad,
      holdingStartKostnad,
      planeradUtdelningAktiv,
      planeradUtdelning,
      ovrigaBolag,
      dotterbolagOverride,
    });
    const { origin, pathname } = window.location;
    return `${origin}${pathname}${query ? `?${query}` : ''}`;
  });

  // Håll adressfältet i synk. Fördröjt, eftersom reglage uppdaterar många
  // gånger per sekund och webbläsare begränsar antalet replaceState-anrop.
  $effect(() => {
    const url = shareUrl;
    const timer = setTimeout(() => window.history.replaceState(null, '', url), 300);
    return () => clearTimeout(timer);
  });
</script>

<Header />

<div class="app-layout">
  <div class="left-col">
    <InputPanel
      bind:agarandel
      bind:totalLonesumma
      bind:omkostnadsbeloppDirekt
      bind:sparatUtrymme
      bind:omkostnadsbeloppHolding
      bind:holdingKostnad
      bind:holdingStartKostnad
      bind:ovrigaBolag
      bind:dotterbolagOverride
      {shareUrl}
    />
  </div>

  <div class="right-col" bind:this={resultatKolumn}>
    <UtrymmeCard {direktResult} {sparatUtrymme} {egenLon} {utrymme} />

    <section class="step-two">
      <h2><span class="step">Steg 2</span> Skulle ett holdingbolag l&ouml;na sig?</h2>
      <p class="step-intro">
        J&auml;mf&ouml;relsen g&auml;ller utrymmet du f&aring;r varje &aring;r fram&ouml;ver,
        med dina v&auml;rden under <em>Holdingbolag</em> i panelen.
        {#if sparatUtrymme > 0}
          Ditt sparade utdelningsutrymme p&aring; {formatSEK(sparatUtrymme)} ing&aring;r inte:
          det f&ouml;ljer med aktierna och kan anv&auml;ndas n&auml;r du s&auml;ljer in dem i
          holdingbolaget, s&aring; att den delen av k&ouml;peskillingen beskattas med 20&nbsp;%.
        {/if}
      </p>
    </section>

    <SavingsCard {direktResult} {holdingResult} />
    <BreakEvenCard
      {breakEven}
      {direktResult}
      {holdingResult}
      {shareUrl}
      bind:planeradUtdelningAktiv
      bind:planeradUtdelning
    />
    <ResultsTable {direktResult} {holdingResult} />
  </div>
</div>

<ExplainerSection />

<Footer />

<MobileResultBar {utrymme} {breakEven} target={resultatKolumn} />

<style>
  .app-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: var(--spacing-lg);
    align-items: start;
  }

  .left-col {
    position: sticky;
    top: var(--spacing-lg);
    /* Panelen är högre än skärmen: scrolla inuti den i stället för att dölja nedre delen */
    max-height: calc(100vh - 2 * var(--spacing-lg));
    overflow-y: auto;
    border-radius: var(--border-radius);
  }

  .right-col {
    min-width: 0;
  }

  .step-two {
    margin: var(--spacing-2xl) 0 var(--spacing-md);
  }

  .step-two h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .step-two .step {
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

  @media (max-width: 900px) {
    .app-layout {
      /* minmax(0, …) så att innehåll inte kan göra kolumnen bredare än skärmen */
      grid-template-columns: minmax(0, 1fr);
    }

    .left-col {
      position: static;
      max-height: none;
      overflow-y: visible;
    }
  }
</style>
