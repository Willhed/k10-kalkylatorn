<script>
  import { formatSEK } from '../lib/formatters.js';
  import { handleBlur, handleFocus, handleKeydown } from '../lib/numberInput.js';

  let {
    id,
    label,
    value = $bindable(),
    // Tillåtet intervall för inskrivna värden
    min = 0,
    max = Infinity,
    // Reglagets intervall; inskrivna värden får ligga utanför det
    sliderMin = min,
    sliderMax,
    step,
    format = formatSEK,
    decimals = 0,
    // Förklaring som visas via ?-knappen
    help = '',
  } = $props();

  let visaHjalp = $state(false);

  // Fältet blir lika brett som värdet, så att etiketten får resten av raden.
  // Siffror är tabulära och exakt 1ch; mellanslag och komma är smalare, "%" bredare.
  // 20px täcker innermarginal och kant.
  const TECKENBREDD = { ' ': 0.45, '\u00a0': 0.45, ',': 0.5, '%': 1.5 };
  let text = $derived(format(value));
  let bredd = $derived.by(() => {
    const ch = [...text].reduce((sum, c) => sum + (TECKENBREDD[c] ?? 1), 0);
    return `calc(${ch.toFixed(2)}ch + 20px)`;
  });
</script>

<div class="field">
  <div class="field-header">
    <div class="field-label">
      <label for={id}>{label}</label>
      {#if help}
        <button
          type="button"
          class="help-btn"
          aria-expanded={visaHjalp}
          aria-controls="{id}-hjalp"
          aria-label="Förklaring: {label}"
          onclick={() => (visaHjalp = !visaHjalp)}
        >?</button>
      {/if}
    </div>
    <input
      class="input-number"
      type="text"
      inputmode="numeric"
      aria-label={label}
      style:width={bredd}
      value={text}
      onfocus={handleFocus}
      onblur={(e) => handleBlur(e, min, max, (v) => (value = v), format, decimals)}
      onkeydown={handleKeydown}
    />
  </div>
  <input
    {id}
    type="range"
    min={sliderMin}
    max={sliderMax}
    {step}
    value={Math.min(value, sliderMax)}
    oninput={(e) => (value = Number(e.target.value))}
  />
  {#if help && visaHjalp}
    <p id="{id}-hjalp" class="field-help">{help}</p>
  {/if}
</div>

<style>
  .field {
    margin-bottom: var(--spacing-lg);
  }

  .field-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .field-label {
    /* Etiketten krymper och radbryts först; fältet flyttas ner först när etiketten inte ryms */
    flex: 1 1 8rem;
  }

  /* ?-knappen följer textflödet efter sista ordet i stället för att ta en egen kolumn */
  .field-label .help-btn {
    margin-left: 4px;
    vertical-align: 1px;
  }

  label {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .input-number {
    margin-left: auto;
  }

  .field-help {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
    font-style: italic;
  }
</style>
