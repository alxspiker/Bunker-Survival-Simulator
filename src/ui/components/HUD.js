import { loadState } from '../../storage.js';
import { getProductionPerHour } from '../../state.js';
import { formatDuration, timeToBoundary } from '../../utils/time.js';

export function HUD() {
  const card = document.createElement('div');
  card.className = 'card hud-card';

  const stats = document.createElement('div');
  stats.className = 'stats-grid';

  const badges = document.createElement('div');
  badges.className = 'badge-row';

  function render() {
    const s = loadState();
    const r = s.resources;
    const caps = s.capacities || { food: Infinity, water: Infinity, power: Infinity };
    const perHour = getProductionPerHour(s);

    stats.innerHTML = '';

    stats.append(
      statTile({
        icon: '🌾',
        label: 'Food',
        value: r.food,
        rate: perHour.food,
        cap: caps.food,
      }),
      statTile({
        icon: '💧',
        label: 'Water',
        value: r.water,
        rate: perHour.water,
        cap: caps.water,
      }),
      statTile({
        icon: '⚡',
        label: 'Power',
        value: r.power,
        rate: perHour.power,
        cap: caps.power,
      })
    );

    badges.innerHTML = '';
    badges.append(
      badge('🌱 Seeds', fmtNum(r.seeds)),
      badge('🔧 Scrap', fmtNum(r.scrap)),
      badge('👥 Population', String(r.population)),
      badge('🙂 Morale', String(r.morale))
    );
  }

  render();
  document.addEventListener('game:tick', render);

  card.appendChild(stats);
  card.appendChild(badges);
  return card;
}

function statTile({ icon, label, value, rate, cap }) {
  const wrap = document.createElement('div');
  wrap.className = 'stat';

  const head = document.createElement('div');
  head.className = 'stat-head';
  head.innerHTML = `<span class="stat-icon">${icon}</span><span class="stat-label">${label}</span>`;

  const val = document.createElement('div');
  val.className = 'stat-value';
  val.textContent = `${value.toFixed(1)}`;

  const meta = document.createElement('div');
  meta.className = 'stat-meta';
  const sign = rate > 0 ? '+' : '';
  meta.textContent = `${sign}${rate.toFixed(2)}/h`;

  const bar = document.createElement('div');
  bar.className = 'capacity-bar';
  const span = document.createElement('span');
  const pct = cap && isFinite(cap) && cap > 0 ? Math.max(0, Math.min(1, value / cap)) : 0;
  span.style.width = `${Math.round(pct * 100)}%`;
  bar.appendChild(span);

  const tte = document.createElement('div');
  tte.className = 'stat-tte';
  const ms = timeToBoundary(value, rate, 0, cap);
  let tteText = '—';
  if (rate > 0 && isFinite(cap) && value < cap) tteText = `full in ${formatDuration(ms)}`;
  else if (rate < 0 && value > 0) tteText = `empty in ${formatDuration(ms)}`;
  else if (rate > 0 && isFinite(cap) && value >= cap) tteText = 'at capacity';
  else if (rate < 0 && value <= 0) tteText = 'depleted';
  tte.textContent = tteText;

  wrap.append(head, val, meta, bar, tte);
  return wrap;
}

function badge(label, value) {
  const el = document.createElement('div');
  el.className = 'badge';
  el.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  return el;
}

function fmtNum(n) {
  return typeof n === 'number' && n % 1 !== 0 ? n.toFixed(1) : String(n);
}