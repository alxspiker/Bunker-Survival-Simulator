import { loadState } from '../../../storage.js';
import { listAvailableActions, canAfford, hasActiveTask } from '../../../game/actions.js';
import { formatDuration } from '../../../utils/time.js';

export function WaterPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'water';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Water</h3><div class="small">Recycling and recovery</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    const room = s.bunker.rooms.water;
    const status = document.createElement('div');
    status.className = 'small';
    status.textContent = formatWaterStatus(room);
    body.appendChild(status);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'actions-list';
    const actions = listAvailableActions(s).filter(a => a.key.includes('water') || a.key === 'purge_filters');
    actionsWrap.append(...renderActions(s, actions));
    body.appendChild(actionsWrap);
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}

function formatWaterStatus(room) {
  if (!room || room.status === 'locked') return 'Not built';
  if (room.status === 'building') return 'Under construction';
  return `Operational · lvl ${room.level || 1}`;
}

function renderActions(state, actions) {
  const active = hasActiveTask(state);
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No water actions available.';
    return [empty];
  }
  return actions.map(a => {
    const row = document.createElement('div');
    row.className = 'item';
    const left = document.createElement('div');
    const right = document.createElement('div');

    const btn = document.createElement('button');
    btn.className = 'btn secondary';
    btn.textContent = active ? 'Busy' : 'Start';

    const affordable = canAfford(state, a.cost);
    const hasDisabledReason = !!a.disabledReason;
    if (!affordable || active || hasDisabledReason) {
      btn.setAttribute('disabled', 'true');
      if (hasDisabledReason) btn.textContent = a.disabledReason;
      else if (!affordable && !active) btn.textContent = `Need: ${formatCostMissing(state, a.cost)}`;
    }

    btn.addEventListener('click', () => !active && affordable && !hasDisabledReason && a.run());

    const costText = a.cost ? ` · Cost: ${formatCost(a.cost)}` : '';
    left.innerHTML = `<div><strong>${a.label}</strong></div><div class="small">${a.description}${a.durationMs ? ` · ${formatDuration(a.durationMs)}` : ''}${costText}</div>`;
    right.appendChild(btn);

    row.append(left, right);
    return row;
  });
}

function formatCost(cost) {
  return Object.entries(cost).map(([k, v]) => `${v} ${k}`).join(', ');
}

function formatCostMissing(state, cost) {
  const miss = [];
  for (const [k, v] of Object.entries(cost || {})) {
    const have = state.resources[k] ?? 0;
    if (have < v) miss.push(`${(v - have).toFixed(1)} ${k}`);
  }
  return miss.join(', ');
}