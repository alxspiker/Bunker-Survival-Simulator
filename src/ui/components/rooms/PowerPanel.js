import { loadState } from '../../../storage.js';
import { listAvailableActions, canAfford, hasActiveTask } from '../../../game/actions.js';
import { formatDuration } from '../../../utils/time.js';
import { formatCost, formatCostMissing } from '../../format.js';

export function PowerPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'power';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Power</h3><div class="small">Generation and stability</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    const room = s.bunker.rooms.power;
    const status = document.createElement('div');
    status.className = 'small';
    status.textContent = formatPowerStatus(room);
    body.appendChild(status);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'actions-list';
    const actions = listAvailableActions(s).filter(a => a.key.includes('power'));
    actionsWrap.append(...renderActions(s, actions));
    body.appendChild(actionsWrap);
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}

function formatPowerStatus(room) {
  if (!room || room.status === 'locked') return 'Not built';
  if (room.status === 'building') return 'Under construction';
  return `Operational · lvl ${room.level || 1}`;
}

function renderActions(state, actions) {
  const active = hasActiveTask(state);
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No power actions available.';
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
      else if (!affordable && !active) btn.textContent = `Missing: ${formatCostMissing(state, a.cost)}`;
    }

    btn.addEventListener('click', () => !active && affordable && !hasDisabledReason && a.run());

    const costText = a.cost ? ` · Cost: ${formatCost(a.cost)}` : '';
    left.innerHTML = `<div><strong>${a.label}</strong></div><div class="small">${a.description}${a.durationMs ? ` · ${formatDuration(a.durationMs)}` : ''}${costText}</div>`;
    right.appendChild(btn);

    row.append(left, right);
    return row;
  });
}