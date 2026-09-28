<script>
  import { beraknaGransbelopp, beraknaBreakEven } from './lib/calculations.js';
  import { IBB, LONEAVDRAG_FACTOR, LONEBASERAT_PERCENTAGE, LONEBASERAT_CAP_FACTOR } from './lib/constants.js';
  import Header from './components/Header.svelte';
  import InputPanel from './components/InputPanel.svelte';
  import ComparisonChart from './components/ComparisonChart.svelte';
  import ResultsTable from './components/ResultsTable.svelte';
  import SavingsCard from './components/SavingsCard.svelte';
  import BreakEvenCard from './components/BreakEvenCard.svelte';
  import ExplainerSection from './components/ExplainerSection.svelte';
  import Footer from './components/Footer.svelte';
  import { readState, writeState } from './lib/urlState.js';

  // Startvärden: från delad länk om sådan finns, annars standard
  const start = readState(window.location.search);

  let agarandel = $state(start.agarandel);
  let totalLonesumma = $state(start.totalLonesumma);
  let omkostnadsbeloppDirekt = $state(start.omkostnadsbeloppDirekt);
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
      {egenLon}
      bind:omkostnadsbeloppDirekt
      bind:omkostnadsbeloppHolding
      bind:holdingKostnad
      bind:holdingStartKostnad
      bind:planeradUtdelningAktiv
      bind:planeradUtdelning
      bind:ovrigaBolag
      bind:dotterbolagOverride
      {shareUrl}
    />
  </div>

  <div class="right-col">
    <SavingsCard {direktResult} {holdingResult} />
    <BreakEvenCard {breakEven} {direktResult} {holdingResult} {shareUrl} />
    <ComparisonChart {direktResult} {holdingResult} />
    <ResultsTable {direktResult} {holdingResult} />
  </div>
</div>

<ExplainerSection />

<Footer />

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
  }

  .right-col {
    min-width: 0;
  }

  @media (max-width: 900px) {
    .app-layout {
      grid-template-columns: 1fr;
    }

    .left-col {
      position: static;
    }
  }
</style>
