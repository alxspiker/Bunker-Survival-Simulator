import { HUD } from './HUD.js';
import { GardenPanel } from './rooms/GardenPanel.js';
import { WaterPanel } from './rooms/WaterPanel.js';
import { PowerPanel } from './rooms/PowerPanel.js';
import { DormitoryPanel } from './rooms/DormitoryPanel.js';
import { OperationsPanel } from './rooms/OperationsPanel.js';
import { TasksPanel } from './rooms/TasksPanel.js';
import { Sidebar, getSavedPanel } from './Sidebar.js';

export function renderGame() {
  const wrap = document.createElement('div');

  // HUD always on top
  wrap.appendChild(HUD());

  // Layout: sidebar + content
  const layout = document.createElement('div');
  layout.className = 'app-layout';

  const content = document.createElement('main');
  content.className = 'content';

  let current = getSavedPanel();

  function mountPanel(key) {
    current = key;
    content.innerHTML = '';
    const panel =
      key === 'garden' ? GardenPanel() :
      key === 'water' ? WaterPanel() :
      key === 'power' ? PowerPanel() :
      key === 'dormitory' ? DormitoryPanel() :
      key === 'tasks' ? TasksPanel() :
      OperationsPanel();
    content.appendChild(panel);
    // Re-render sidebar to reflect active state
    sidebar.replaceWith(Sidebar({ current, onSelect: mountPanel }));
  }

  const sidebar = Sidebar({ current, onSelect: mountPanel });
  layout.appendChild(sidebar);
  layout.appendChild(content);

  wrap.appendChild(layout);

  // Initial mount
  mountPanel(current);

  const foot = document.createElement('footer');
  foot.textContent = 'Real-time progression. Your save lives in your browser.';
  wrap.appendChild(foot);

  return wrap;
}