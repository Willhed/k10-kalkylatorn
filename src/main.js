import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';
import { loadAnalytics } from './lib/analytics.js';

loadAnalytics();

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;
