// Besöksstatistik via Umami (cookiefri, ingen samtyckesbanner krävs).
// Laddas bara när VITE_UMAMI_WEBSITE_ID är satt, t.ex. i Vercels miljövariabler,
// så att lokal utveckling och förhandsvisningar inte räknas.

const SCRIPT_URL = 'https://cloud.umami.is/script.js';
const DOMAINS = 'k10-kalkylatorn.se,www.k10-kalkylatorn.se';

export function loadAnalytics() {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  if (!websiteId) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = SCRIPT_URL;
  script.dataset.websiteId = websiteId;
  script.dataset.domains = DOMAINS;
  document.head.appendChild(script);
}
