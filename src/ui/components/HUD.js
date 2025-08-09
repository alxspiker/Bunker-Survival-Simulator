import { loadState } from '../../storage.js';
import { getProductionPerHour } from '../../state.js';

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

  const update = () => {
    const s = loadState();
    const r = s.resources;
    const perHour = getProductionPerHour(s);
    resources.innerHTML = '';
    resources.append(
      makeTag('Food', `${r.food.toFixed(1)} (${fmtRate(perHour.food)}/h)`),
      makeTag('Water', `${r.water.toFixed(1)} (${fmtRate(perHour.water)}/h)`),
      makeTag('Power', `${r.power.toFixed(1)} (${fmtRate(perHour.power)}/h)`),
      makeTag('Seeds', r.seeds.toFixed?.(1) ?? r.seeds),
      makeTag('Scrap', r.scrap),
      makeTag('Population', s.resources.population),
      makeTag('Morale', s.resources.morale)
    );
  };

  update();
  wrap.appendChild(resources);

  document.addEventListener('game:tick', update);
  return wrap;
}

function fmtRate(x) {
  const sign = x > 0 ? '+' : '';
  return `${sign}${x.toFixed(2)}`;
}