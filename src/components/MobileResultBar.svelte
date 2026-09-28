<script>
  import { formatSEK } from '../lib/formatters.js';

  // Fast resultatrad längst ner på mobil. Panelen ligger först där, så utan
  // raden syns inget resultat medan man ändrar värden. Döljs när resultaten
  // (target) redan syns på skärmen.
  let { utrymme, breakEven, target } = $props();

  let resultatSyns = $state(false);

  $effect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      resultatSyns = entry.isIntersecting;
    });
    observer.observe(target);
    return () => observer.disconnect();
  });
</script>

<nav class="mobile-bar" class:dold={resultatSyns} aria-label="Resultat" inert={resultatSyns}>
  <a href="#utdelningsutrymme" data-umami-event="Resultatrad – utrymme">
    <span class="bar-label">Ditt utrymme</span>
    <span class="bar-value">{formatSEK(utrymme)}</span>
  </a>
  <a href="#holdingbolag" data-umami-event="Resultatrad – holding">
    <span class="bar-label">Holdingbolag, netto</span>
    <span class="bar-value" class:positive={breakEven.lonsamt} class:negative={!breakEven.lonsamt}>
      {breakEven.netto >= 0 ? '+' : '−'}{formatSEK(Math.abs(breakEven.netto))}/&aring;r
    </span>
  </a>
</nav>

<style>
  .mobile-bar {
    display: none;
  }

  @media (max-width: 900px) {
    .mobile-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
      padding-bottom: env(safe-area-inset-bottom);
      transition: transform 0.2s ease;
    }

    .mobile-bar.dold {
      transform: translateY(100%);
    }
  }

  a {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-sm) var(--spacing-md);
    text-decoration: none;
    color: var(--color-text);
  }

  a + a {
    border-left: 1px solid var(--color-border);
  }

  .bar-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .bar-value {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .bar-value.positive {
    color: var(--color-success);
  }

  .bar-value.negative {
    color: var(--color-danger);
  }

  @media (prefers-reduced-motion: reduce) {
    .mobile-bar {
      transition: none;
    }
  }
</style>
