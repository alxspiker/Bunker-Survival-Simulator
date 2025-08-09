import { loadState, saveState } from '../storage.js';
import { nowMs } from '../utils/time.js';
import { addLog, clampResources, getProductionPerHour, getRoomLevel } from '../state.js';

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

  // Process tasks (construction, planting, crop growth, upgrades, maintenance, recruit, scout)
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
      room.level = 1;
      room.buildEndsAt = null;
      addLog(state, `${capitalize(task.room)} is now operational.`);
    }
  }

  if (task.type === 'planting') {
    // Planting complete -> start a background 1-day growth task
    const now = nowMs();
    const growthDuration = 24 * 3600_000;
    state.tasks.push({
      id: `task_${Math.random().toString(36).slice(2)}`,
      type: 'crop-growth',
      scope: 'background',
      startedAt: now,
      endsAt: now + growthDuration,
      durationMs: growthDuration,
      yield: { base: 5 },
      description: 'Crops growing (background)',
    });
    addLog(state, 'Planting finished. Crops are now growing (1 day).');
  }

  if (task.type === 'crop-growth') {
    const level = getRoomLevel(state, 'garden');
    const base = task.yield?.base ?? 5;
    const yieldFood = Math.round(base * (1 + 0.5 * Math.max(0, level - 1)));
    state.resources.food += yieldFood;
    addLog(state, `Harvest complete. +${yieldFood} food.`);
  }

  if (task.type === 'upgrade-room') {
    const room = state.bunker.rooms[task.room];
    if (room && room.status === 'active') {
      room.level = (room.level || 1) + 1;
      addLog(state, `${capitalize(task.room)} upgraded to level ${room.level}.`);
    }
  }

  if (task.type === 'maintenance') {
    const reward = task.reward || {};
    for (const [k, v] of Object.entries(reward)) {
      state.resources[k] = (state.resources[k] ?? 0) + v;
    }
    addLog(state, 'Maintenance complete. Systems are running smoother.');
  }

  if (task.type === 'recruit') {
    state.resources.population += 1;
    state.resources.morale += 2;
    addLog(state, 'A survivor joined the bunker. +1 population, +2 morale.');
  }

  if (task.type === 'scout') {
    // Very simple loot table
    const roll = Math.random();
    if (roll < 0.6) {
      const scrap = 2 + Math.floor(Math.random() * 3);
      state.resources.scrap += scrap;
      addLog(state, `Scouting found scrap: +${scrap}.`);
    } else if (roll < 0.85) {
      state.resources.seeds += 1;
      addLog(state, 'Scouting found seeds: +1.');
    } else {
      state.resources.morale -= 2;
      addLog(state, 'Scouting encountered danger. Morale -2.');
    }
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }