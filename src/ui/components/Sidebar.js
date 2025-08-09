const PANEL_KEY = 'bunker.ui.panel.v1';

const PANELS = [
  { key: 'tasks', label: 'Tasks', icon: '📋' },
  { key: 'garden', label: 'Garden', icon: '🌾' },
  { key: 'water', label: 'Water', icon: '💧' },
  { key: 'power', label: 'Power', icon: '⚡' },
  { key: 'dormitory', label: 'Dormitory', icon: '🛏️' },
  { key: 'operations', label: 'Operations', icon: '🧭' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export function getSavedPanel() {
  try { return localStorage.getItem(PANEL_KEY) || 'tasks'; } catch { return 'tasks'; }
}
export function savePanel(key) {
  try { localStorage.setItem(PANEL_KEY, key); } catch {}
}

export function Sidebar({ current, onSelect }) {
  const nav = document.createElement('aside');
  nav.className = 'sidebar';

  const list = document.createElement('div');
  list.className = 'sidebar-list';

  for (const p of PANELS) {
    const btn = document.createElement('button');
    btn.className = 'sidebar-item';
    if (p.key === current) btn.classList.add('active');
    btn.innerHTML = `<span class="si">${p.icon}</span><span>${p.label}</span>`;
    btn.addEventListener('click', () => {
      if (p.key === current) return;
      onSelect?.(p.key);
      savePanel(p.key);
    });
    list.appendChild(btn);
  }

  nav.appendChild(list);
  return nav;
}