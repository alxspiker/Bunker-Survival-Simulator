import { loadState } from '../../storage.js';
import { getProductionPerHour } from '../../state.js';
import { formatDuration, timeToBoundary } from '../../utils/time.js';

export function HUD(state) {
  const wrap = document.createElement('div');
  wrap.className = 'card hud';

  const makeTag = (label, value) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.innerHTML = `<span>${label}</span> <strong>${value}</strong>`;
    return el;
  };

  const resources = document.createElement('div');
  resources.className = 'hud';

  const timers = document.createElement('div');
  timers.className = 'list';

  const timersTitle = document.createElement('div');
  timersTitle.className = 'h2';
  timersTitle.textContent = 'Time Until Empty/Full';

  const update = () => {
    const s = loadState();
    const r = s.resources;
    const caps = s.capacities || { food: Infinity, water: Infinity, power: Infinity };
    const perHour = getProductionPerHour(s);

    resources.innerHTML = '';
    resources.append(
      makeTag('Food', `${r.food.toFixed(1)} (${fmtRate(perHour.food)}/h)`),
      makeTag('Water', `${r.water.toFixed(1)} (${fmtRate(perHour.water)}/h)`),
      makeTag('Power', `${r.power.toFixed(1)} (${fmtRate(perHour.power)}/h)`),
      makeTag('Seeds', r.seeds.toFixed?.(1) ?? r.seeds),
      makeTag('Scrap', s.resources.scrap),
      makeTag('Population', s.resources.population),
      makeTag('Morale', s.resources.morale)
    );

    timers.innerHTML = '';
    timers.append(
      timerLine('Food', r.food, perHour.food, 0, caps.food),
      timerLine('Water', r.water, perHour.water, 0, caps.water),
      timerLine('Power', r.power, perHour.power, 0, caps.power)
    );
  };

  update();
  wrap.appendChild(resources);
  wrap.appendChild(document.createElement('hr')).className = 'sep';
  wrap.appendChild(timersTitle);
  wrap.appendChild(timers);

  document.addEventListener('game:tick', update);
  return wrap;
}

function timerLine(label, current, rate, min, max) {
  const item = document.createElement('div');
  item.className = 'item';
  const tMs = timeToBoundary(current, rate, min, max);
  let txt = 'stable';
  if (rate > 0 && current < max) txt = `full in ${formatDuration(tMs)}`;
  else if (rate < 0 && current > min) txt = `empty in ${formatDuration(tMs)}`;
  else if (rate > 0 && current >= max) txt = 'at capacity';
  else if (rate < 0 && current <= min) txt = 'depleted';
  item.innerHTML = `<div><strong>${label}</strong></div><div class="small">${txt}</div>`;
  return item;
}

function fmtRate(x) {
  const sign = x > 0 ? '+' : '';
  return `${sign}${x.toFixed(2)}`;
}