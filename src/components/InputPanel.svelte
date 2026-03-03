<script>
  import { formatSEK, formatPercent } from '../lib/formatters.js';

  let {
    agarandel = $bindable(),
    totalLonesumma = $bindable(),
    egenLon,
    omkostnadsbeloppDirekt = $bindable(),
    omkostnadsbeloppHolding = $bindable(),
  } = $props();

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function parseNumber(str) {
    // Allow dots and commas as decimal separators
    const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }

  function roundTo(val, decimals) {
    const factor = 10 ** decimals;
    return Math.round(val * factor) / factor;
  }

  function handleBlur(e, min, max, setter, formatter, decimals = 0) {
    const val = parseNumber(e.target.value);
    if (!isNaN(val)) {
      const clamped = clamp(roundTo(val, decimals), min, max);
      setter(clamped);
      e.target.value = formatter(clamped);
    }
  }

  function handleFocus(e) {
    e.target.select();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }
</script>

<div class="card input-panel">
  <h2>Parametrar</h2>

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
    <p class="input-help">Direkt: din andel. Holding: holdingbolagets andel (&ouml;ver 50 % ger l&ouml;neunderlag)</p>
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
</div>

<style>
  .input-panel h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: var(--spacing-lg);
    color: var(--color-primary);
  }

  .input-group {
    margin-bottom: var(--spacing-xl);
  }

  .input-group:last-child {
    margin-bottom: 0;
  }

  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--spacing-sm);
  }

  label {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .input-value-wrapper {
    flex-shrink: 0;
  }

  .input-number {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
    background: transparent;
    border: 1.5px solid transparent;
    border-radius: 6px;
    padding: 2px 8px;
    text-align: right;
    width: auto;
    max-width: 160px;
    font-family: inherit;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .input-number:hover {
    border-color: var(--color-border);
  }

  .input-number:focus {
    outline: none;
    border-color: var(--color-primary);
    background: var(--color-surface);
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--color-border);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 3px solid var(--color-surface);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  input[type="range"]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 3px solid var(--color-surface);
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
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
</style>
