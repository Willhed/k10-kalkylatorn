<script>
  import { formatSEK, formatPercent } from '../lib/formatters.js';
  import { clamp, parseNumber, roundTo, handleBlur, handleFocus, handleKeydown } from '../lib/numberInput.js';

  let {
    agarandel = $bindable(),
    totalLonesumma = $bindable(),
    egenLon,
    omkostnadsbeloppDirekt = $bindable(),
    sparatUtrymme = $bindable(),
    omkostnadsbeloppHolding = $bindable(),
    holdingKostnad = $bindable(),
    holdingStartKostnad = $bindable(),
    ovrigaBolag = $bindable(),
    dotterbolagOverride = $bindable(),
    shareUrl,
  } = $props();

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

  <div class="input-group">
    <div class="input-header">
      <label for="agarandel">Andel i operativbolaget</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatPercent(agarandel)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 1, 100, (v) => agarandel = v, formatPercent, 2)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="agarandel"
      type="range"
      min="1"
      max="100"
      step="0.05"
      bind:value={agarandel}
    />
    <div class="range-labels">
      <span>1 %</span>
      <span>50 %</span>
      <span>100 %</span>
    </div>
    <p class="input-help">Din andel av aktierna i bolaget</p>
  </div>

  <div class="input-group">
    <div class="input-header">
      <label for="lonesumma">Total l&ouml;nesumma i bolaget</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(totalLonesumma)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => totalLonesumma = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="lonesumma"
      type="range"
      min="0"
      max="15000000"
      step="50000"
      value={Math.min(totalLonesumma, 15000000)}
      oninput={(e) => totalLonesumma = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>7,5 Mkr</span>
      <span>15 Mkr</span>
    </div>
    <p class="input-help">Alla anst&auml;lldas l&ouml;ner inkl. &auml;garens</p>
  </div>

  <div class="input-group computed-group">
    <div class="input-header">
      <label>&Auml;garens l&ouml;n (ber&auml;knad)</label>
      <span class="computed-value">{formatSEK(egenLon)}</span>
    </div>
    <p class="input-help">Minsta l&ouml;n f&ouml;r att inte begr&auml;nsas av 50&times;-taket</p>
  </div>

  <div class="input-group">
    <div class="input-header">
      <label for="omkostnad-direkt">Omkostnadsbelopp &mdash; operativbolaget</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(omkostnadsbeloppDirekt)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => omkostnadsbeloppDirekt = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="omkostnad-direkt"
      type="range"
      min="0"
      max="5000000"
      step="25000"
      value={Math.min(omkostnadsbeloppDirekt, 5000000)}
      oninput={(e) => omkostnadsbeloppDirekt = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>2,5 Mkr</span>
      <span>5 Mkr</span>
    </div>
    <p class="input-help">Anskaffningsv&auml;rde f&ouml;r aktier i operativbolaget</p>
  </div>

  <div class="input-group">
    <div class="input-header">
      <label for="sparat-utrymme">Sparat utdelningsutrymme</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(sparatUtrymme)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => sparatUtrymme = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="sparat-utrymme"
      type="range"
      min="0"
      max="3000000"
      step="10000"
      value={Math.min(sparatUtrymme, 3000000)}
      oninput={(e) => sparatUtrymme = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>1,5 Mkr</span>
      <span>3 Mkr</span>
    </div>
    <p class="input-help">Outnyttjat utrymme fr&aring;n tidigare &aring;r (finns p&aring; f&ouml;rra &aring;rets K10)</p>
  </div>

  <div class="input-group ovriga-group">
    <div class="input-header">
      <label>&#214;vriga f&#229;mansbolag du &#228;ger</label>
    </div>
    <p class="input-help">
      Grundbeloppet (4 &times; IBB) &#228;r gemensamt f&#246;r alla dina f&#229;mansbolag.
      &#196;ger du andelar i fler bolag s&#229; proportioneras det.
    </p>
    {#each ovrigaBolag as bolag, i}
      <div class="ovriga-row">
        <input
          class="ovriga-namn"
          type="text"
          placeholder="Bolag {i + 1}"
          bind:value={ovrigaBolag[i].namn}
          onkeydown={handleKeydown}
        />
        <div class="input-value-wrapper">
          <input
            class="input-number"
            type="text"
            inputmode="numeric"
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
        </div>
        <button class="remove-btn" onclick={() => ovrigaBolag.splice(i, 1)} aria-label="Ta bort {bolag.namn || 'Bolag ' + (i + 1)}">&times;</button>
      </div>
    {/each}
    <button class="add-btn" onclick={() => ovrigaBolag.push({ namn: '', andel: 100 })}>+ L&#228;gg till bolag</button>
  </div>

  <h3 class="section-label">2 &middot; Holdingbolag</h3>
  <p class="section-help">
    Holdingbolaget antas &auml;gas till 100&nbsp;% av dig och &auml;ga din andel av bolaget ovan.
    &Ouml;ver 50&nbsp;% r&auml;knas bolagets l&ouml;ner med i holdingbolagets l&ouml;neunderlag.
  </p>
  {#if agarandel <= 50}
    <div class="input-group">
      <label class="checkbox-row first">
        <input type="checkbox" bind:checked={dotterbolagOverride} />
        <span>Best&auml;mmande inflytande (dotterbolag enligt &Aring;RL 1:4)</span>
      </label>
      <p class="input-help">
        Kryssa i om holdingbolaget har best&auml;mmande inflytande via t.ex.
        r&ouml;stmajoritet, styrelsemajoritet eller avtal &mdash; trots kapitalandel under 50 %.
      </p>
    </div>
  {/if}

  <div class="input-group">
    <div class="input-header">
      <label for="omkostnad-holding">Omkostnadsbelopp &mdash; holdingbolag</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(omkostnadsbeloppHolding)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => omkostnadsbeloppHolding = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="omkostnad-holding"
      type="range"
      min="0"
      max="5000000"
      step="25000"
      value={Math.min(omkostnadsbeloppHolding, 5000000)}
      oninput={(e) => omkostnadsbeloppHolding = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>2,5 Mkr</span>
      <span>5 Mkr</span>
    </div>
    <p class="input-help">Anskaffningsv&auml;rde f&ouml;r aktier i holdingbolaget</p>
  </div>

  <div class="input-group">
    <div class="input-header">
      <label for="holding-kostnad">&Aring;rlig kostnad f&ouml;r holdingbolaget</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(holdingKostnad)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => holdingKostnad = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="holding-kostnad"
      type="range"
      min="0"
      max="30000"
      step="500"
      value={Math.min(holdingKostnad, 30000)}
      oninput={(e) => holdingKostnad = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>15 000 kr</span>
      <span>30 000 kr</span>
    </div>
    <p class="input-help">Bokf&ouml;ring, &aring;rsredovisning och bankavgifter</p>
  </div>

  <div class="input-group">
    <div class="input-header">
      <label for="holding-startkostnad">Uppstartskostnad f&ouml;r holdingbolaget</label>
      <div class="input-value-wrapper">
        <input
          class="input-number"
          type="text"
          inputmode="numeric"
          value={formatSEK(holdingStartKostnad)}
          onfocus={handleFocus}
          onblur={(e) => handleBlur(e, 0, Infinity, (v) => holdingStartKostnad = v, formatSEK)}
          onkeydown={handleKeydown}
        />
      </div>
    </div>
    <input
      id="holding-startkostnad"
      type="range"
      min="0"
      max="30000"
      step="500"
      value={Math.min(holdingStartKostnad, 30000)}
      oninput={(e) => holdingStartKostnad = Number(e.target.value)}
    />
    <div class="range-labels">
      <span>0 kr</span>
      <span>15 000 kr</span>
      <span>30 000 kr</span>
    </div>
    <p class="input-help">Eng&aring;ngskostnad: bolagsordning, registrering och r&aring;dgivning</p>
  </div>
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

  .checkbox-row.first {
    margin-top: 0;
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
    margin-bottom: var(--spacing-xl);
  }

  .input-group:last-child {
    margin-bottom: 0;
  }

  .input-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .input-header > label {
    /* Etiketten krymper och radbryts först; fältet flyttas ner först när etiketten inte ryms */
    flex: 1 1 8rem;
  }

  label {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .input-value-wrapper {
    flex-shrink: 0;
    /* Håll fältet högerställt även när det bryts ner på egen rad */
    margin-left: auto;
  }

  .input-help {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
    font-style: italic;
  }

  .computed-group {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: 8px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .computed-value {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
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
