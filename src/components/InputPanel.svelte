<script>
  import { formatSEK, formatPercent } from '../lib/formatters.js';
  import { clamp, parseNumber, roundTo, handleFocus, handleKeydown } from '../lib/numberInput.js';
  import NumberField from './NumberField.svelte';

  let {
    agarandel = $bindable(),
    totalLonesumma = $bindable(),
    omkostnadsbeloppDirekt = $bindable(),
    sparatUtrymme = $bindable(),
    omkostnadsbeloppHolding = $bindable(),
    holdingKostnad = $bindable(),
    holdingStartKostnad = $bindable(),
    ovrigaBolag = $bindable(),
    dotterbolagOverride = $bindable(),
    shareUrl,
  } = $props();

  // Förklaringar för fält som inte är sifferfält; sifferfälten hanterar sina egna
  let hjalp = $state({ ovriga: false, dotter: false });

  let kopierad = $state(false);
  let kopieringsfel = $state(false);

  async function kopieraLank() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      kopierad = true;
      kopieringsfel = false;
      setTimeout(() => (kopierad = false), 2000);
    } catch {
      kopieringsfel = true;
    }
  }
</script>

<div class="card input-panel">
  <div class="panel-header">
    <h2>Parametrar</h2>
    <button type="button" class="share-btn" onclick={kopieraLank} data-umami-event="Kopiera länk">
      {kopierad ? 'Kopierad!' : 'Kopiera länk'}
    </button>
  </div>
  {#if kopieringsfel}
    <p class="input-help">Kunde inte kopiera. Kopiera l&auml;nken fr&aring;n adressf&auml;ltet i st&auml;llet.</p>
  {/if}

  <h3 class="section-label">1 &middot; Ditt bolag</h3>

  <NumberField
    id="agarandel"
    label="Andel i operativbolaget"
    bind:value={agarandel}
    min={1}
    max={100}
    sliderMax={100}
    step={0.05}
    format={formatPercent}
    decimals={2}
    help="Din andel av aktierna i bolaget."
  />

  <NumberField
    id="lonesumma"
    label="Total lönesumma i bolaget"
    bind:value={totalLonesumma}
    sliderMax={15_000_000}
    step={50_000}
    help="Alla anställdas kontanta bruttolöner under föregående år, inklusive dina egna."
  />

  <NumberField
    id="omkostnad-direkt"
    label="Omkostnadsbelopp"
    bind:value={omkostnadsbeloppDirekt}
    sliderMax={5_000_000}
    step={25_000}
    help="Vad du betalade för aktierna i bolaget, t.ex. aktiekapitalet vid start."
  />

  <NumberField
    id="sparat-utrymme"
    label="Sparat utdelningsutrymme"
    bind:value={sparatUtrymme}
    sliderMax={3_000_000}
    step={10_000}
    help="Outnyttjat utdelningsutrymme från tidigare år. Finns på förra årets K10."
  />

  <div class="input-group ovriga-group">
    <div class="group-label">
      <span class="label-text">&Ouml;vriga f&aring;mansbolag du &auml;ger</span>
      <button
        type="button"
        class="help-btn"
        aria-expanded={hjalp.ovriga}
        aria-controls="ovriga-hjalp"
        aria-label="Förklaring: övriga fåmansbolag"
        onclick={() => (hjalp.ovriga = !hjalp.ovriga)}
      >?</button>
    </div>
    {#if hjalp.ovriga}
      <p id="ovriga-hjalp" class="input-help">
        Grundbeloppet (4 &times; IBB) &auml;r gemensamt f&ouml;r alla dina f&aring;mansbolag.
        &Auml;ger du andelar i fler bolag delas det mellan dem.
      </p>
    {/if}
    {#each ovrigaBolag as bolag, i}
      <div class="ovriga-row">
        <input
          class="ovriga-namn"
          type="text"
          placeholder="Bolag {i + 1}"
          aria-label="Namn på bolag {i + 1}"
          bind:value={ovrigaBolag[i].namn}
          onkeydown={handleKeydown}
        />
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          aria-label="Ägarandel i {bolag.namn || 'bolag ' + (i + 1)}"
          value={formatPercent(bolag.andel)}
          onfocus={handleFocus}
          onblur={(e) => {
            const val = parseNumber(e.target.value);
            if (!isNaN(val)) {
              ovrigaBolag[i].andel = clamp(roundTo(val, 2), 1, 100);
              e.target.value = formatPercent(ovrigaBolag[i].andel);
            }
          }}
          onkeydown={handleKeydown}
        />
        <button class="remove-btn" onclick={() => ovrigaBolag.splice(i, 1)} aria-label="Ta bort {bolag.namn || 'Bolag ' + (i + 1)}">&times;</button>
      </div>
    {/each}
    <button class="add-btn" onclick={() => ovrigaBolag.push({ namn: '', andel: 100 })}>+ L&auml;gg till bolag</button>
  </div>

  <h3 class="section-label">2 &middot; Holdingbolag</h3>
  <p class="section-help">Antas &auml;gas till 100&nbsp;% av dig och &auml;ga din andel av bolaget ovan.</p>

  {#if agarandel <= 50}
    <div class="input-group">
      <div class="group-label">
        <label class="checkbox-row">
          <input type="checkbox" bind:checked={dotterbolagOverride} />
          <span>Best&auml;mmande inflytande</span>
        </label>
        <button
          type="button"
          class="help-btn"
          aria-expanded={hjalp.dotter}
          aria-controls="dotter-hjalp"
          aria-label="Förklaring: bestämmande inflytande"
          onclick={() => (hjalp.dotter = !hjalp.dotter)}
        >?</button>
      </div>
      {#if hjalp.dotter}
        <p id="dotter-hjalp" class="input-help">
          Kryssa i om holdingbolaget har best&auml;mmande inflytande (&Aring;RL 1:4) via t.ex.
          r&ouml;stmajoritet, styrelsemajoritet eller avtal &mdash; trots kapitalandel under 50&nbsp;%.
          D&aring; r&auml;knas bolagets l&ouml;ner med i holdingbolagets l&ouml;neunderlag.
        </p>
      {/if}
    </div>
  {/if}

  <NumberField
    id="omkostnad-holding"
    label="Omkostnadsbelopp"
    bind:value={omkostnadsbeloppHolding}
    sliderMax={5_000_000}
    step={25_000}
    help="Vad du betalar för aktierna i holdingbolaget, t.ex. aktiekapitalet."
  />

  <NumberField
    id="holding-kostnad"
    label="Årlig kostnad"
    bind:value={holdingKostnad}
    sliderMax={30_000}
    step={500}
    help="Bokföring, årsredovisning och bankavgifter för holdingbolaget."
  />

  <NumberField
    id="holding-startkostnad"
    label="Uppstartskostnad"
    bind:value={holdingStartKostnad}
    sliderMax={30_000}
    step={500}
    help="Engångskostnad för att starta holdingbolaget: bolagsordning, registrering och rådgivning."
  />
</div>

<style>
  .section-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);
    padding-top: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .section-help {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: calc(-1 * var(--spacing-sm)) 0 var(--spacing-lg);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .input-panel h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  .share-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-primary);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 4px 10px;
    transition: border-color 0.15s ease;
  }

  .share-btn:hover {
    border-color: var(--color-primary);
  }

  .input-group {
    margin-bottom: var(--spacing-lg);
  }

  .group-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .group-label .checkbox-row {
    margin-top: 0;
  }

  .label-text {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .input-group:last-child {
    margin-bottom: 0;
  }

  .input-help {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
    font-style: italic;
  }

  .ovriga-group {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .ovriga-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }

  /* "100 %" behöver mindre plats än beloppsfälten; resten går till bolagsnamnet */
  .ovriga-row .input-number {
    width: 5em;
  }

  .ovriga-namn {
    flex: 1;
    font-size: 0.85rem;
    color: var(--color-text);
    background: transparent;
    border: 1.5px solid transparent;
    border-radius: 6px;
    padding: 3px 8px;
    font-family: inherit;
    transition: border-color 0.15s ease, background-color 0.15s ease;
    min-width: 0;
  }

  .ovriga-namn::placeholder {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .ovriga-namn:hover {
    border-color: var(--color-border);
  }

  .ovriga-namn:focus {
    outline: none;
    border-color: var(--color-primary);
    background: white;
  }

  .remove-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 2px 7px;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .remove-btn:hover {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .add-btn {
    display: block;
    width: 100%;
    margin-top: var(--spacing-sm);
    background: none;
    border: 1px dashed var(--color-border);
    border-radius: 6px;
    color: var(--color-primary);
    cursor: pointer;
    font-size: 0.85rem;
    font-family: inherit;
    padding: var(--spacing-xs) var(--spacing-sm);
    text-align: center;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .add-btn:hover {
    background: var(--color-surface);
    border-color: var(--color-primary);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    font-size: 0.85rem;
    font-weight: 400;
    cursor: pointer;
  }

  .checkbox-row input[type="checkbox"] {
    accent-color: var(--color-primary);
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
</style>
