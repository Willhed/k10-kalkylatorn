<script>
  import { Chart, registerables } from 'chart.js';
  import { onMount } from 'svelte';

  Chart.register(...registerables);

  let { direktResult, holdingResult } = $props();

  let canvas;
  let chart;

  function getChartData() {
    return {
      labels: ['Grundbelopp', 'Lönebaserat utrymme', 'Ränta omk.belopp', 'Gränsbelopp (totalt)'],
      datasets: [
        {
          label: `Direkt ägande (${Math.round(direktResult.agarandel * 100)} %)`,
          data: [
            direktResult.grundbelopp,
            direktResult.lonebaseratUtrymme,
            direktResult.rantaUtrymme,
            direktResult.gransbelopp,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Via holdingbolag',
          data: [
            holdingResult.grundbelopp,
            holdingResult.lonebaseratUtrymme,
            holdingResult.rantaUtrymme,
            holdingResult.gransbelopp,
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }

  function getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString('sv-SE')} kr`,
          },
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 16,
            font: { family: "'Inter', system-ui, sans-serif", size: 13 },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString('sv-SE')} Mkr`;
              if (v >= 1_000) return `${(v / 1_000).toLocaleString('sv-SE')} tkr`;
              return `${v} kr`;
            },
            font: { family: "'Inter', system-ui, sans-serif" },
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        x: {
          ticks: {
            font: { family: "'Inter', system-ui, sans-serif", size: 12 },
          },
          grid: { display: false },
        },
      },
    };
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: getChartData(),
      options: getChartOptions(),
    });

    return () => chart?.destroy();
  });

  $effect(() => {
    // Access reactive props to trigger effect
    const _d = direktResult.gransbelopp;
    const _h = holdingResult.gransbelopp;

    if (chart) {
      chart.data = getChartData();
      chart.update('none');
    }
  });
</script>

<div class="card chart-card">
  <h2>J&auml;mf&ouml;relse</h2>
  <div class="chart-container">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>

<style>
  .chart-card h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
  }

  .chart-container {
    position: relative;
    height: 350px;
  }
</style>
