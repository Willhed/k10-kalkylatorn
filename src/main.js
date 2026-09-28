// Typsnittet ligger på den egna servern: inga anrop till Google Fonts
import '@fontsource-variable/inter';
import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';
import { loadAnalytics } from './lib/analytics.js';

loadAnalytics();

// #app innehåller förrenderad HTML (för sökmotorer och snabb första bild).
// Den ersätts av den interaktiva appen; rensning och montering sker i samma
// steg, så ingen tom sida hinner visas.
const target = document.getElementById('app');
target.textContent = '';
const app = mount(App, { target });

export default app;
