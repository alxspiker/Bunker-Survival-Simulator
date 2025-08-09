import { HUD } from './HUD.js';
import { ActionsPanel } from './ActionsPanel.js';
import { LogView } from './Log.js';
import { loadState } from '../../storage.js';
import { formatDuration, nowMs } from '../../utils/time.js';
import { forceCompleteTask } from '../../game/gameEngine.js';

export function renderGame(state) {
  const wrap = document.createElement('div');

  wrap.appendChild(HUD(state));

  const mainRow = document.createElement('div');
  mainRow.className = 'row';

  const left = document.createElement('div');
  left.className = 'col';
  left.appendChild(RoomsCard());
  left.appendChild(ActionsPanel());

  const right = document.createElement('div');
  right.className = 'col';
  right.appendChild(TasksCard());
  right.appendChild(LogView());

  mainRow.append(left, right);
  wrap.appendChild(mainRow);

  const foot = document.createElement('footer');
  foot.textContent = 'Real-time progression. Your save lives in your browser.';
  wrap.appendChild(foot);

  return wrap;
}

function RoomsCard() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('div');
  title.className = 'h2';
  title.textContent = 'Bunker Rooms';

  const grid = document.createElement('div');
  grid.className = 'grid';

  function render() {
    const s = loadState();
    grid.innerHTML = '';
    for (const [key, room] of Object.entries(s.bunker.rooms)) {
      const cell = document.createElement('div');
      cell.className = 'item';
      const status = formatRoomStatus(room);
      cell.innerHTML = `<div><strong>${capitalize(key)}</strong><div class="small">${status}</div></div>`;
      grid.appendChild(cell);
    }
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(title, grid);
  return card;
}

function formatRoomStatus(room) {
  if (room.status === 'locked') return 'Not built';
  if (room.status === 'building') {
    const remain = Math.max(0, (room.buildEndsAt || 0) - nowMs());
    return `Building · ${formatDuration(remain)}`;
  }
  if (room.status === 'active') return 'Operational';
  return 'Unknown';
}

function TasksCard() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('div');
  title.className = 'h2';
  title.textContent = 'Tasks';

  const list = document.createElement('div');
  list.className = 'list';

  function render() {
    const s = loadState();
    list.innerHTML = '';
    if (s.tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'small';
      empty.textContent = 'No active tasks.';
      list.appendChild(empty);
      return;
    }
    for (const t of s.tasks) {
      const remain = Math.max(0, t.endsAt - nowMs());
      const item = document.createElement('div');
      item.className = 'item';
      const left = document.createElement('div');
      left.innerHTML = `<div><strong>${t.description}</strong></div><div class="small">${formatDuration(remain)}</div>`;
      const right = document.createElement('div');
      const progress = Math.min(1, (t.durationMs - remain) / t.durationMs);
      const bar = document.createElement('div');
      bar.className = 'progress';
      const span = document.createElement('span');
      span.style.width = `${Math.round(progress * 100)}%`;
      bar.appendChild(span);

      const skip = document.createElement('button');
      skip.className = 'btn';
      skip.textContent = 'Skip (Debug)';
      skip.style.marginLeft = '8px';
      skip.addEventListener('click', () => forceCompleteTask(t.id));

      right.appendChild(bar);
      right.appendChild(skip);
      item.append(left, right);
      list.appendChild(item);
    }
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(title, list);
  return card;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }