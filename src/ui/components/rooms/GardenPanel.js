import { loadState } from '../../../storage.js';
import { listAvailableActions, canAfford, hasActiveTask } from '../../../game/actions.js';
import { formatDuration, nowMs } from '../../../utils/time.js';
import { formatCost, formatCostMissing } from '../../format.js';

export function GardenPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'garden';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Garden</h3><div class="small">Food production via crops</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    const room = s.bunker.rooms.garden;
    const status = document.createElement('div');
    status.className = 'small';
    status.textContent = formatGardenStatus(s, room);
    body.appendChild(status);

    const growth = currentGrowth(s);
    if (growth) {
      const remain = Math.max(0, growth.endsAt - nowMs());
      const bar = document.createElement('div');
      bar.className = 'progress';
      const span = document.createElement('span');
      const progress = Math.min(1, (growth.durationMs - remain) / growth.durationMs);
      span.style.width = `${Math.round(progress * 100)}%`;
      bar.appendChild(span);
      const meta = document.createElement('div');
      meta.className = 'small';
      meta.textContent = `Crop growing · ${formatDuration(remain)}`;
      body.append(bar, meta);
    }

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'actions-list';
    const actions = listAvailableActions(s).filter(a => a.key.startsWith('build_garden') || a.key.startsWith('upgrade_garden') || a.key.startsWith('plant_seeds'));
    actionsWrap.append(...renderActions(s, actions));
    body.appendChild(actionsWrap);
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}

function currentGrowth(state) {
  return (state.tasks || []).find(t => t.type === 'crop-growth' && (t.scope || 'background') === 'background');
}

function formatGardenStatus(state, room) {
  if (!room || room.status === 'locked') return 'Not built';
  if (room.status === 'building') return 'Under construction';
  return `Operational · lvl ${room.level || 1}`;
}

function renderActions(state, actions) {
  const active = hasActiveTask(state);
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No garden actions available.';
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