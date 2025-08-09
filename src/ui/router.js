import { Onboarding } from './components/Onboarding.js';
import { renderGame } from './components/BunkerView.js';
import { loadState } from '../storage.js';

let rootEl = null;

export function mountRouter(root) {
  rootEl = root;
}

export function showOnboarding({ onComplete }) {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  rootEl.appendChild(Onboarding({ onComplete }));
}

export function showGame(initialState) {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  const state = initialState || loadState();
  rootEl.appendChild(renderGame(state));
}