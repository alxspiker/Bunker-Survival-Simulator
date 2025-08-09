import { loadState } from '../../../storage.js';
import { listAvailableActions, canAfford, hasActiveTask } from '../../../game/actions.js';
import { formatDuration } from '../../../utils/time.js';

export function OperationsPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'operations';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Operations</h3><div class="small">Scouting and global actions</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'actions-list';
    const actions = listAvailableActions(s).filter(a => a.key.includes('scout'));
    actionsWrap.append(...renderActions(s, actions));
    body.appendChild(actionsWrap);

    const log = document.createElement('div');
    log.className = 'list log';
    const title = document.createElement('div');
    title.className = 'h2';
    title.textContent = 'Recent Log';
    body.appendChild(title);

    for (const entry of s.log.slice(0, 6)) {
      const line = document.createElement('div');
      line.className = 'item';
      const dt = new Date(entry.ts).toLocaleString();
      line.innerHTML = `<div class="small">${dt}</div><div>${entry.text}</div>`;
      log.appendChild(line);
    }
    body.appendChild(log);
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}

function renderActions(state, actions) {
  const active = hasActiveTask(state);
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No operations available.';
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
    if (!affordable || active) {
      btn.setAttribute('disabled', 'true');
      if (!affordable && !active) btn.textContent = `Need: ${formatCostMissing(state, a.cost)}`;
    }

    btn.addEventListener('click', () => !active && affordable && a.run());

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