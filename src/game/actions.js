import { loadState, saveState } from '../storage.js';
import { nowMs } from '../utils/time.js';
import { addLog } from '../state.js';

export function listAvailableActions(state) {
  const actions = [];
  const rooms = state.bunker.rooms;

  if (rooms.garden.status === 'locked') {
    actions.push({
      key: 'build_garden',
      label: 'Set up Garden Room (1h)',
      description: 'Convert a room with grow lights and soil beds to start producing food.',
      durationMs: 1 * 3600_000,
      cost: { seeds: 2, power: 1 },
      run: () => scheduleBuild('garden', 1 * 3600_000, { seeds: 2, power: 1 }),
    });
  }

  if (rooms.water.status === 'locked') {
    actions.push({
      key: 'build_water',
      label: 'Install Water Recycler (2h)',
      description: 'Set up filtration and condensation units to reclaim water.',
      durationMs: 2 * 3600_000,
      cost: { scrap: 3, power: 1 },
      run: () => scheduleBuild('water', 2 * 3600_000, { scrap: 3, power: 1 }),
    });
  }

  if (rooms.power.status === 'locked') {
    actions.push({
      key: 'build_power',
      label: 'Wire Generator Room (2h 30m)',
      description: 'Bring a small generator online for stable power.',
      durationMs: 2.5 * 3600_000,
      cost: { scrap: 4 },
      run: () => scheduleBuild('power', 2.5 * 3600_000, { scrap: 4 }),
    });
  }

  if (rooms.dormitory.status === 'locked') {
    actions.push({
      key: 'build_dorm',
      label: 'Prepare Dormitory (1h 30m)',
      description: 'Beds and basic amenities improve morale and support more survivors.',
      durationMs: 1.5 * 3600_000,
      cost: { scrap: 2 },
      run: () => scheduleBuild('dormitory', 1.5 * 3600_000, { scrap: 2 }),
    });
  }

  // Planting seeds is available once the garden is operational and no crop is currently growing
  if (rooms.garden.status === 'active' && !hasActiveBackgroundCrop(state)) {
    actions.push({
      key: 'plant_seeds',
      label: 'Plant Seeds (5m)',
      description: 'Prepare beds and plant seeds. Starts a 1-day growth cycle (background).',
      durationMs: 5 * 60_000,
      cost: { seeds: 1, water: 1 },
      run: () => schedulePlanting(5 * 60_000, { seeds: 1, water: 1 }),
    });
  }

  return actions;
}

export function hasActiveTask(state) {
  return (state.tasks || []).some(t => (t.scope || 'foreground') === 'foreground');
}

export function hasActiveBackgroundCrop(state) {
  return (state.tasks || []).some(t => t.type === 'crop-growth' && (t.scope || 'background') === 'background');
}

export function canAfford(state, cost) {
  if (!cost) return true;
  for (const [k, v] of Object.entries(cost)) {
    if ((state.resources[k] ?? 0) < v) return false;
  }
  return true;
}

export function payCost(state, cost) {
  if (!cost) return;
  for (const [k, v] of Object.entries(cost)) {
    state.resources[k] = (state.resources[k] ?? 0) - v;
  }
}

function scheduleBuild(roomKey, durationMs, cost) {
  const state = loadState();
  if (!state) return;

  if (hasActiveTask(state)) {
    addLog(state, 'You are already working on a task. Only one task can run at a time.');
    saveState(state);
    document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
    return;
  }

  if (!canAfford(state, cost)) return;

  const now = nowMs();

  payCost(state, cost);
  state.bunker.rooms[roomKey].status = 'building';
  state.bunker.rooms[roomKey].buildEndsAt = now + durationMs;

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'build-room',
    scope: 'foreground',
    room: roomKey,
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    description: `Building ${roomKey}`,
  };

  state.tasks.push(task);
  addLog(state, `Started building ${roomKey}. ETA ${Math.round(durationMs / 60000)}m.`);
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

function schedulePlanting(durationMs, cost) {
  const state = loadState();
  if (!state) return;

  if (hasActiveTask(state)) {
    addLog(state, 'You are already working on a task. Only one task can run at a time.');
    saveState(state);
    document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
    return;
  }

  if (hasActiveBackgroundCrop(state)) {
    addLog(state, 'The garden is already growing. Wait for the harvest before planting again.');
    saveState(state);
    document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
    return;
  }

  if (!canAfford(state, cost)) return;
  const now = nowMs();
  payCost(state, cost);

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'planting',
    scope: 'foreground',
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    description: 'Planting seeds in the garden',
  };

  state.tasks.push(task);
  addLog(state, `Started planting. Will finish in ${Math.round(durationMs / 60000)}m.`);
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}