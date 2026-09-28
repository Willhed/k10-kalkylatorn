<script>
  import { mailtoLink } from '../lib/contact.js';
</script>

<footer class="footer">
  <div class="cta">
    <p class="cta-text">Vill du ha personlig r&aring;dgivning kring din 3:12-situation?</p>
    <a href={mailtoLink()} class="btn btn-primary" data-umami-event="Mejl – footer">Skicka mejl</a>
  </div>
  <p class="disclaimer">
    Detta verktyg ger en f&ouml;renklad ber&auml;kning av gr&auml;nsbeloppet enligt de nya 3:12-reglerna.
  </p>
  <p class="disclaimer">
    Sidan m&auml;ter bes&ouml;k anonymt utan cookies. Inga personuppgifter sparas.
  </p>
  <p class="sources">
    K&auml;llor:
    <a href="https://www.foretagarna.se/driva-eget-foretag/handbocker-och-guider/handbok-312-reglerna/nya-312-reglerna-fran-2026/" target="_blank" rel="noopener">F&ouml;retagarna</a>
    &middot;
    <a href="https://blogg.pwc.se/taxmatters/nya-312-regler" target="_blank" rel="noopener">PwC</a>
    &middot;
    <a href="https://skatteverket.se/foretag/drivaforetag/foretagsformer/famansforetag/famansforetagochkvalificeradeandelar.4.6efe6285127ab4f1d2580001532.html" target="_blank" rel="noopener">Skatteverket</a>
  </p>
</footer>

<style>
  .footer {
    margin-top: var(--spacing-2xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .cta {
    margin-bottom: var(--spacing-lg);
  }

  .cta-text {
    margin-bottom: var(--spacing-sm);
    font-size: 0.95rem;
    color: var(--color-text-muted);
  }

  .btn {
    display: inline-block;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .disclaimer {
    margin-bottom: var(--spacing-sm);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .sources a {
    color: var(--color-primary-light);
    text-decoration: none;
  }

  .sources a:hover {
    text-decoration: underline;
  }
</style>
