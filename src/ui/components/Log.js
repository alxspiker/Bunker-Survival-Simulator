import { loadState } from '../../storage.js';

export function LogView() {
  const wrap = document.createElement('div');
  wrap.className = 'card';

  const title = document.createElement('div');
  title.className = 'h2';
  title.textContent = 'Log';

  const list = document.createElement('div');
  list.className = 'list log';

  function render() {
    const state = loadState();
    list.innerHTML = '';
    for (const entry of state.log) {
      const line = document.createElement('div');
      line.className = 'item';
      const dt = new Date(entry.ts).toLocaleString();
      line.innerHTML = `<div class="small">${dt}</div><div>${entry.text}</div>`;
      list.appendChild(line);
    }
  }

  render();
  document.addEventListener('game:tick', render);

  wrap.append(title, list);
  return wrap;
}