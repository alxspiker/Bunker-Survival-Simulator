import { loadState, saveState } from '../storage.js';
import { nowMs } from '../utils/time.js';
import { addLog, getRoomLevel, getPopulationCap } from '../state.js';

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

  // Garden actions when operational
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
  if (rooms.garden.status === 'active') {
    const level = getRoomLevel(state, 'garden');
    actions.push({
      key: 'upgrade_garden',
      label: `Upgrade Garden (lvl ${level + 1}) (2h)`,
      description: 'Increase yield on harvests.',
      durationMs: 2 * 3600_000,
      cost: { scrap: 3, seeds: 1 },
      run: () => scheduleUpgrade('garden', 2 * 3600_000, { scrap: 3, seeds: 1 }),
    });
  }

  if (rooms.water.status === 'active') {
    const level = getRoomLevel(state, 'water');
    actions.push({
      key: 'upgrade_water',
      label: `Upgrade Water Recycler (lvl ${level + 1}) (2h)`,
      description: 'Improve water recovery efficiency.',
      durationMs: 2 * 3600_000,
      cost: { scrap: 3 },
      run: () => scheduleUpgrade('water', 2 * 3600_000, { scrap: 3 }),
    });
    actions.push({
      key: 'purge_filters',
      label: 'Purge Filters (30m)',
      description: 'Maintenance task that prevents breakdowns and gives a small water burst.',
      durationMs: 30 * 60_000,
      cost: { power: 0.5 },
      run: () => scheduleMaintenance('water', 30 * 60_000, { power: 0.5 }, { water: 2 }),
    });
  }

  if (rooms.power.status === 'active') {
    const level = getRoomLevel(state, 'power');
    actions.push({
      key: 'upgrade_power',
      label: `Upgrade Generator (lvl ${level + 1}) (2h)`,
      description: 'Improve power output and efficiency.',
      durationMs: 2 * 3600_000,
      cost: { scrap: 4 },
      run: () => scheduleUpgrade('power', 2 * 3600_000, { scrap: 4 }),
    });
    actions.push({
      key: 'maintain_generator',
      label: 'Generator Maintenance (20m)',
      description: 'Perform maintenance to avoid power spikes; small power burst.',
      durationMs: 20 * 60_000,
      cost: { scrap: 1 },
      run: () => scheduleMaintenance('power', 20 * 60_000, { scrap: 1 }, { power: 2 }),
    });
  }

  if (rooms.dormitory.status === 'active') {
    const level = getRoomLevel(state, 'dormitory');
    actions.push({
      key: 'upgrade_dorm',
      label: `Upgrade Dormitory (lvl ${level + 1}) (2h)`,
      description: 'Increase population capacity and morale.',
      durationMs: 2 * 3600_000,
      cost: { scrap: 3 },
      run: () => scheduleUpgrade('dormitory', 2 * 3600_000, { scrap: 3 }),
    });
    if (state.resources.population < getPopulationCap(state)) {
      actions.push({
        key: 'recruit_survivor',
        label: 'Recruit Survivor (1h)',
        description: 'Risk a short foray to find a survivor to join your bunker.',
        durationMs: 1 * 3600_000,
        cost: { food: 1, water: 1 },
        run: () => scheduleRecruit(1 * 3600_000, { food: 1, water: 1 }),
      });
    }
  }

  actions.push({
    key: 'scout_area',
    label: 'Scout Area (3h)',
    description: 'Gather intel and maybe find scrap (risk: small).',
    durationMs: 3 * 3600_000,
    cost: { food: 1, water: 1 },
    run: () => scheduleScouting(3 * 3600_000, { food: 1, water: 1 }),
  });

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

  if (state.bunker.rooms.garden.status !== 'active') {
    addLog(state, 'The garden is not operational.');
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

function scheduleUpgrade(roomKey, durationMs, cost) {
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

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'upgrade-room',
    scope: 'foreground',
    room: roomKey,
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    description: `Upgrading ${roomKey}`,
  };

  state.tasks.push(task);
  addLog(state, `Started upgrading ${roomKey}. ETA ${Math.round(durationMs / 60000)}m.`);
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

function scheduleMaintenance(roomKey, durationMs, cost, reward) {
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

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'maintenance',
    scope: 'foreground',
    room: roomKey,
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    reward: reward || {},
    description: `Maintaining ${roomKey}`,
  };

  state.tasks.push(task);
  addLog(state, `Started maintenance on ${roomKey}.`);
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

function scheduleRecruit(durationMs, cost) {
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

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'recruit',
    scope: 'foreground',
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    description: 'Recruiting a survivor',
  };

  state.tasks.push(task);
  addLog(state, 'Left to recruit a survivor.');
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}

function scheduleScouting(durationMs, cost) {
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

  const task = {
    id: `task_${Math.random().toString(36).slice(2)}`,
    type: 'scout',
    scope: 'foreground',
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    description: 'Scouting the area',
  };

  state.tasks.push(task);
  addLog(state, 'Scouting party dispatched.');
  saveState(state);
  document.dispatchEvent(new CustomEvent('game:tick', { detail: { state } }));
}