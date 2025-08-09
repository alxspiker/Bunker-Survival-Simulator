import { loadState, saveState } from '../storage.js';
import { nowMs } from '../utils/time.js';
import { addLog, clampResources, getProductionPerHour } from '../state.js';

let intervalId = null;

export function startEngine() {
  if (intervalId) return;
  processTick(true); // process offline immediately on load
  intervalId = setInterval(() => processTick(false), 1000);
}

export function stopEngine() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

function processTick(isInitial) {
  const state = loadState();
  if (!state?.account) return;
  const now = nowMs();
  const elapsedMs = Math.max(0, now - (state.lastUpdateAt || now));

  // Cap offline progression to avoid extreme jumps (e.g., max 7 days per load)
  const cappedElapsedMs = isInitial ? Math.min(elapsedMs, 7 * 24 * 3600_000) : elapsedMs;

  // Resource production/consumption over elapsed time
  const perHour = getProductionPerHour(state);
  const hoursElapsed = cappedElapsedMs / 3600_000;
  state.resources.food += perHour.food * hoursElapsed;
  state.resources.water += perHour.water * hoursElapsed;
  state.resources.power += perHour.power * hoursElapsed;

  // Process tasks (construction etc.)
  const completed = [];
  for (const task of state.tasks) {
    if (task.endsAt <= now) completed.push(task);
  }
  if (completed.length > 0) {
    for (const t of completed) applyTaskCompletion(state, t);
    state.tasks = state.tasks.filter(t => !completed.includes(t));
  }

  clampResources(state);

  state.lastUpdateAt = now;
  saveState(state);

  // Also update UI bindings by dispatching a simple event
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

export function forceCompleteTask(taskId) {
  const state = loadState();
  if (!state?.tasks?.length) return;
  const idx = state.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const task = state.tasks[idx];
  applyTaskCompletion(state, task);
  state.tasks.splice(idx, 1);
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

function applyTaskCompletion(state, task) {
  if (task.type === 'build-room') {
    const room = state.bunker.rooms[task.room];
    if (room) {
      room.status = 'active';
      room.buildEndsAt = null;
      addLog(state, `${capitalize(task.room)} is now operational.`);
    }
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }