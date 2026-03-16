<section class="explainer">
  <div class="explainer-grid">

    <div class="card explainer-card">
      <h2 class="card-title">Vad är 3:12-reglerna?</h2>
      <p>
        3:12-reglerna styr hur utdelning och kapitalvinst från fåmansbolag beskattas.
        Som ägare till ett fåmansbolag kan du ta ut utdelning till en lägre skattesats
        (20&nbsp;%) upp till ett visst belopp — det så kallade <strong>gränsbeloppet</strong>.
        Utdelning över gränsbeloppet beskattas istället som tjänsteinkomst (~50&nbsp;%).
      </p>
      <p>
        Från 2026 gäller nya regler som höjer lönekravet och förändrar hur
        gränsbeloppet beräknas. Det gör det viktigare än tidigare att planera
        sin ägarstruktur och löneuttag noggrant.
      </p>
    </div>

    <div class="card explainer-card">
      <h2 class="card-title">Vad är gränsbelopp?</h2>
      <p>
        Gränsbeloppet är det maximala belopp du kan ta ut som lågbeskattad
        utdelning (20&nbsp;%) under ett år. Det beräknas som summan av tre delar:
      </p>
      <ul>
        <li><strong>Grundbelopp</strong> — din ägarandel × 4 × IBB (inkomstbasbeloppet)</li>
        <li><strong>Lönebaserat utrymme</strong> — baserat på lönesumman i bolaget minus ett löneavdrag om 8 × IBB</li>
        <li><strong>Ränta på omkostnadsbelopp</strong> — ditt anskaffningsvärde × (statslåneräntan + 9&nbsp;%)</li>
      </ul>
      <p>
        Oanvänt gränsbelopp sparas till nästa år (sparat utdelningsutrymme) men räknas inte längre upp med statslåneräntan — det är en av förändringarna i de nya 3:12-reglerna från 2026.
      </p>
    </div>

    <div class="card explainer-card">
      <h2 class="card-title">Varför holdingbolag?</h2>
      <p>
        Många ägare väljer att äga sitt operativa bolag via ett holdingbolag.
        Fördelen är att utdelning från driftsbolaget till holdingbolaget är
        <strong>skattefri</strong> (näringsbetingade andelar), vilket gör att
        du kan låta kapitalet växa i holdingbolaget utan att betala skatt förrän
        du tar ut pengarna privat.
      </p>
      <p>
        Om holdingbolaget har <strong>bestämmande inflytande</strong> (äger mer än
        50&nbsp;% av kapitalet, eller har rätt att tillsätta styrelsen) räknas även
        lönerna i driftsbolaget in i K10-beräkningen — precis som vid direkt ägande.
      </p>
    </div>

    <div class="card explainer-card full-width">
      <h2 class="card-title">Vad f&ouml;r&auml;ndrades i 3:12-reglerna 2026?</h2>
      <div class="changes-grid">
        <div class="change-item">
          <span class="change-label">Grundbeloppet h&ouml;js</span>
          <p>Fr&aring;n 2,75 × IBB till <strong>4 × IBB</strong> per &auml;garprocentenhet. Gynnar &auml;gare med l&aring;g l&ouml;nesumma.</p>
        </div>
        <div class="change-item">
          <span class="change-label">H&ouml;gre l&ouml;nekrav</span>
          <p>Du m&aring;ste ta ut l&ouml;n motsvarande minst <strong>8 × IBB</strong> (ca 592&nbsp;000 kr 2026) f&ouml;r att f&aring; tillg&aring;ng till det l&ouml;nebaserade utrymmet — upp fr&aring;n 6 × IBB.</p>
        </div>
        <div class="change-item">
          <span class="change-label">Sparat utdelningsutrymme</span>
          <p>R&auml;knas inte l&auml;ngre upp med statsl&aring;ner&auml;ntan. Gammalt sparat utrymme beh&aring;ller sitt v&auml;rde men v&auml;xer inte mer.</p>
        </div>
        <div class="change-item">
          <span class="change-label">Ny takregel f&ouml;r tj&auml;nsteinkomst</span>
          <p>Utdelning &ouml;ver gr&auml;nsbeloppet tj&auml;nstebeskattas, men taket s&auml;tts vid <strong>100 × IBB</strong> (ca 7,4 Mkr). &Ouml;verskjutande del beskattas som kapital.</p>
        </div>
      </div>
    </div>

    <div class="card explainer-card">
      <h2 class="card-title">Direkt ägande vs holdingbolag</h2>
      <p>
        Vid <strong>direkt ägande</strong> äger du aktierna i driftsbolaget privat.
        Utdelning inom gränsbeloppet beskattas med 20&nbsp;%, resten som tjänst.
      </p>
      <p>
        Via <strong>holdingbolag</strong> äger du istället ett holdingbolag som
        i sin tur äger driftsbolaget. Utdelningen kan parkeras i holdingbolaget
        och återinvesteras utan omedelbar privatskatt. Nackdelen är något mer
        administration och initiala bolagskostnader.
      </p>
      <p>
        Kalkylatorn ovan hjälper dig se vilket alternativ ger störst
        gränsbelopp givet din specifika situation.
      </p>
    </div>

  </div>
</section>

<style>
  .explainer {
    margin-top: var(--spacing-2xl);
  }

  .explainer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .card-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }

  .explainer-card p {
    font-size: 0.9rem;
    color: var(--color-text);
    line-height: 1.6;
    margin-bottom: var(--spacing-sm);
  }

  .explainer-card p:last-child {
    margin-bottom: 0;
  }

  .explainer-card ul {
    font-size: 0.9rem;
    color: var(--color-text);
    line-height: 1.6;
    margin: var(--spacing-sm) 0;
    padding-left: var(--spacing-lg);
  }

  .explainer-card li {
    margin-bottom: var(--spacing-xs);
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .changes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
  }

  .change-item {
    background: var(--color-primary-bg);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-md);
  }

  .change-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .change-item p {
    font-size: 0.875rem;
    color: var(--color-text);
    line-height: 1.5;
    margin-bottom: 0;
  }

  @media (max-width: 900px) {
    .explainer-grid {
      grid-template-columns: 1fr;
    }

    .full-width {
      grid-column: 1;
    }

    .changes-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
