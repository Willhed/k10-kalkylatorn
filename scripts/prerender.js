// Förrenderar appen till dist/index.html efter bygget, så att sökmotorer och
// länkförhandsvisningar ser innehållet utan att köra JavaScript.
// Körs av "npm run build" efter klient- och serverbygget.
import { readFile, writeFile, rm } from 'node:fs/promises';

const INDEX = new URL('../dist/index.html', import.meta.url);
const SSR = new URL('../dist-ssr/entry-server.js', import.meta.url);
const PLATSHALLARE = '<div id="app"></div>';

const { renderApp } = await import(SSR.href);
const html = await readFile(INDEX, 'utf8');
if (!html.includes(PLATSHALLARE)) {
  throw new Error(`Hittar inte ${PLATSHALLARE} i dist/index.html`);
}

const body = renderApp();
await writeFile(INDEX, html.replace(PLATSHALLARE, `<div id="app">${body}</div>`));
await rm(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true });
console.log(`Förrenderat dist/index.html (${Math.round(body.length / 1024)} kB HTML)`);
