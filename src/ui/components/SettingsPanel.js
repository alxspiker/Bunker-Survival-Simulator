export function SettingsPanel({ onReset }) {
  const card = document.createElement('section');
  card.className = 'card section';
  card.id = 'settings';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h3 class="h">Settings</h3><div class="small">Manage your save</div>`;

  const body = document.createElement('div');
  body.className = 'section-body';

  const reset = document.createElement('button');
  reset.className = 'btn bad';
  reset.textContent = 'Delete All Data (Reset Game)';
  reset.addEventListener('click', () => {
    if (!confirm('Delete all progress and return to setup?')) return;
    try {
      localStorage.clear();
    } catch {}
    onReset?.();
  });

  const note = document.createElement('div');
  note.className = 'small';
  note.textContent = 'Stored locally in your browser. This cannot be undone.';

  body.append(reset, note);
  card.append(header, body);
  return card;
}