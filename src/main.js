// Typsnittet ligger på den egna servern: inga anrop till Google Fonts
import '@fontsource-variable/inter';
import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';
import { loadAnalytics } from './lib/analytics.js';

loadAnalytics();

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;
