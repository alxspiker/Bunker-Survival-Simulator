import { loadState, saveState, hasExistingSave } from './storage.js';
import { createInitialState } from './state.js';
import { mountRouter, showOnboarding, showGame } from './ui/router.js';
import { startEngine, stopEngine } from './game/gameEngine.js';

function bootstrap() {
  const appRoot = document.getElementById('app');
  mountRouter(appRoot);

  let state = loadState();

  if (!hasExistingSave() || !state?.account?.id) {
    showOnboarding({
      onComplete: ({ name, scenarioKey }) => {
        state = createInitialState({ playerName: name, scenarioKey });
        saveState(state);
        showGame(state);
        startEngine();
      },
    });
  } else {
    showGame(state);
    startEngine();
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);

// Hot reload guard for engines in dev environments
window.addEventListener('beforeunload', () => {
  try { stopEngine(); } catch {}
});