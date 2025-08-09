import { loadState } from '../../../storage.js';
import { formatDuration, nowMs } from '../../../utils/time.js';
import { forceCompleteTask } from '../../../game/gameEngine.js';

export function TasksPanel() {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'tasks';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Tasks</h3><div class="small">Active foreground and background tasks</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  function render() {
    const s = loadState();
    body.innerHTML = '';

    if (!s.tasks || s.tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'small';
      empty.textContent = 'No active tasks.';
      body.appendChild(empty);
      return;
    }

    for (const t of s.tasks) {
      const remain = Math.max(0, t.endsAt - nowMs());
      const row = document.createElement('div');
      row.className = 'item';

      const left = document.createElement('div');
      const scopeTag = t.scope === 'background' ? '<span class="small">Background</span>' : '<span class="small">Foreground</span>';
      const roomTag = t.room ? ` · <span class="small">${t.room}</span>` : '';
      left.innerHTML = `<div><strong>${t.description}</strong> ${scopeTag}${roomTag}</div><div class="small">${formatDuration(remain)}</div>`;

      const right = document.createElement('div');
      const progress = Math.min(1, (t.durationMs - remain) / t.durationMs);
      const bar = document.createElement('div');
      bar.className = 'progress';
      const span = document.createElement('span');
      span.style.width = `${Math.round(progress * 100)}%`;
      bar.appendChild(span);
      right.appendChild(bar);

      if (t.scope !== 'background') {
        const skip = document.createElement('button');
        skip.className = 'btn';
        skip.textContent = 'Skip (Debug)';
        skip.style.marginLeft = '8px';
        skip.addEventListener('click', () => forceCompleteTask(t.id));
        right.appendChild(skip);
      }

      row.append(left, right);
      body.appendChild(row);
    }
  }

  render();
  document.addEventListener('game:tick', render);

  card.append(header, body);
  return card;
}