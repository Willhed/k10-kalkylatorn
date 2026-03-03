<script>
  import { beraknaGransbelopp } from './lib/calculations.js';
  import { IBB, LONEAVDRAG_FACTOR, LONEBASERAT_PERCENTAGE, LONEBASERAT_CAP_FACTOR } from './lib/constants.js';
  import Header from './components/Header.svelte';
  import InputPanel from './components/InputPanel.svelte';
  import ComparisonChart from './components/ComparisonChart.svelte';
  import ResultsTable from './components/ResultsTable.svelte';
  import SavingsCard from './components/SavingsCard.svelte';
  import Footer from './components/Footer.svelte';

  let agarandel = $state(25);
  let totalLonesumma = $state(2_000_000);
  let omkostnadsbeloppDirekt = $state(100_000);
  let omkostnadsbeloppHolding = $state(100_000);

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
    beraknaGransbelopp(agarandel / 100, totalLonesumma, egenLon, omkostnadsbeloppDirekt)
  );

  // Holdingbolag: du äger 100% av holding, holding äger samma andel av opco
  // Om andel > 50%: löner från opco räknas in (proportionellt)
  let holdingLonesumma = $derived(
    agarandel > 50 ? (agarandel / 100) * totalLonesumma : 0
  );
  let holdingEgenLon = $derived(
    agarandel > 50 ? egenLon : 0
  );
  let holdingResult = $derived(
    beraknaGransbelopp(1.0, holdingLonesumma, holdingEgenLon, omkostnadsbeloppHolding)
  );
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
    />
  </div>

  <div class="right-col">
    <SavingsCard {direktResult} {holdingResult} />
    <ComparisonChart {direktResult} {holdingResult} />
    <ResultsTable {direktResult} {holdingResult} />
  </div>
</div>

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
