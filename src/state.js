import { scenarios } from './game/scenarios.js';
import { nowMs } from './utils/time.js';

export function createInitialState({ playerName, scenarioKey }) {
  const scenario = scenarios[scenarioKey] || scenarios.nuclear;
  const createdAt = nowMs();
  const id = `acct_${Math.random().toString(36).slice(2)}`;

  return {
    version: 1,
    account: {
      id,
      name: playerName?.trim() || 'Survivor',
      createdAt,
    },
    scenario: scenario.key,
    bunker: {
      rooms: {
        entrance: { level: 1, builtAt: createdAt },
        garden: { status: 'locked', buildEndsAt: null, level: 0 },
        water: { status: 'locked', buildEndsAt: null, level: 0 },
        power: { status: 'locked', buildEndsAt: null, level: 0 },
        dormitory: { status: 'locked', buildEndsAt: null, level: 0 },
      },
    },
    capacities: {
      food: 50,
      water: 50,
      power: 30,
    },
    resources: {
      food: scenario.starting.food,
      water: scenario.starting.water,
      power: scenario.starting.power,
      seeds: scenario.starting.seeds,
      scrap: scenario.starting.scrap,
      population: scenario.starting.population,
      morale: scenario.starting.morale,
    },
    tasks: [],
    log: [
      { ts: createdAt, text: `Account created. Scenario: ${scenario.name}.` },
      { ts: createdAt, text: 'You enter your bunker. First objective: set up the Garden Room.' },
    ],
    lastUpdateAt: createdAt,
  };
}

export function addLog(state, text, ts) {
  state.log.unshift({ ts: ts ?? Date.now(), text });
  state.log = state.log.slice(0, 200);
}

export function getRoomLevel(state, roomKey) {
  const r = state.bunker.rooms[roomKey];
  if (!r) return 0;
  if (r.status === 'active' && !r.level) r.level = 1;
  return r.level || 0;
}

export function getPopulationCap(state) {
  const dormLevel = getRoomLevel(state, 'dormitory');
  return 3 + dormLevel * 2;
}

export function getProductionPerHour(state) {
  // Returns net production per hour for each resource based on active rooms and population
  const perHour = { food: 0, water: 0, power: 0 };

  const { rooms } = state.bunker;
  const population = state.resources.population;

  // Garden does not passively produce food; harvests yield food
  if (rooms.water.status === 'active') perHour.water += 0.5 + 0.5 * getRoomLevel(state, 'water');
  if (rooms.power.status === 'active') perHour.power += 1 + 1 * getRoomLevel(state, 'power');

  // Consumption per hour
  perHour.food -= population * 0.3; // each person consumes
  perHour.water -= population * 0.4;
  perHour.power -= 0.5; // baseline consumption

  return perHour;
}

export function clampResources(state) {
  const r = state.resources;
  const c = state.capacities || { food: Infinity, water: Infinity, power: Infinity };
  r.food = Math.min(Math.max(0, r.food), c.food);
  r.water = Math.min(Math.max(0, r.water), c.water);
  r.power = Math.min(Math.max(0, r.power), c.power);
}