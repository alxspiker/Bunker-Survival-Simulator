import { loadState } from '../../../storage.js';
import { listAvailableActions, canAfford, hasActiveTask } from '../../../game/actions.js';
import { getPopulationCap } from '../../../state.js';
import { formatDuration } from '../../../utils/time.js';
import { formatCost, formatCostMissing } from '../../format.js';

export function DormitoryPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'dormitory';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Dormitory</h3><div class="small">Beds, morale, and capacity</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    const room = s.bunker.rooms.dormitory;
    const status = document.createElement('div');
    status.className = 'small';
    const cap = getPopulationCap(s);
    status.textContent = formatDormStatus(room) + ` · capacity ${s.resources.population}/${cap}`;
    body.appendChild(status);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'actions-list';
    const actions = listAvailableActions(s).filter(a => a.key.includes('dorm'))
      .concat(listAvailableActions(s).filter(a => a.key.includes('recruit')));
    actionsWrap.append(...renderActions(s, actions));
    body.appendChild(actionsWrap);
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}

function formatDormStatus(room) {
  if (!room || room.status === 'locked') return 'Not built';
  if (room.status === 'building') return 'Under construction';
  return `Operational · lvl ${room.level || 1}`;
}

function renderActions(state, actions) {
  const active = hasActiveTask(state);
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No dormitory actions available.';
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