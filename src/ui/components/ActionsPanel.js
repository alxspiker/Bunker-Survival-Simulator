import { listAvailableActions, canAfford, hasActiveTask } from '../../game/actions.js';
import { loadState } from '../../storage.js';
import { formatDuration } from '../../utils/time.js';

export function ActionsPanel() {
  const wrap = document.createElement('div');
  wrap.className = 'card';

  const title = document.createElement('div');
  title.className = 'h2';
  title.textContent = 'Actions';

  const list = document.createElement('div');
  list.className = 'list';

  const notice = document.createElement('div');
  notice.className = 'small warn';

  function render() {
    const state = loadState();
    const actions = listAvailableActions(state);
    const active = hasActiveTask(state);
    list.innerHTML = '';

    notice.textContent = active ? 'A task is already in progress. Only one task may run at a time.' : '';

    if (actions.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'small';
      empty.textContent = 'No actions available right now. Let time pass or prepare for expeditions (coming soon).';
      list.appendChild(empty);
      return;
    }

    for (const a of actions) {
      const item = document.createElement('div');
      item.className = 'item';
      const left = document.createElement('div');
      const right = document.createElement('div');

      const btn = document.createElement('button');
      btn.className = 'btn secondary';
      btn.textContent = active ? 'Busy' : 'Start';

      const affordable = canAfford(state, a.cost);
      if (!affordable || active) {
        btn.setAttribute('disabled', 'true');
        if (!affordable && !active) {
          btn.textContent = `Need: ${formatCostMissing(state, a.cost)}`;
        }
      }

      btn.addEventListener('click', () => !active && affordable && a.run());

      const costText = a.cost ? ` · Cost: ${formatCost(a.cost)}` : '';
      left.innerHTML = `<div><strong>${a.label}</strong></div><div class="small">${a.description}${a.durationMs ? ` · ${formatDuration(a.durationMs)}` : ''}${costText}</div>`;
      right.appendChild(btn);

      item.append(left, right);
      list.appendChild(item);
    }
  }

  render();
  document.addEventListener('game:tick', render);

  wrap.append(title, notice, list);
  return wrap;
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