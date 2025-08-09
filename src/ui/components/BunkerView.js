import { HUD } from './HUD.js';
import { GardenPanel } from './rooms/GardenPanel.js';
import { WaterPanel } from './rooms/WaterPanel.js';
import { PowerPanel } from './rooms/PowerPanel.js';
import { DormitoryPanel } from './rooms/DormitoryPanel.js';
import { OperationsPanel } from './rooms/OperationsPanel.js';

export function renderGame(state) {
  const wrap = document.createElement('div');

  wrap.appendChild(HUD(state));

  const grid = document.createElement('div');
  grid.className = 'dashboard-grid';
  grid.append(
    GardenPanel(),
    WaterPanel(),
    PowerPanel(),
    DormitoryPanel(),
    OperationsPanel()
  );

  wrap.appendChild(grid);

  const foot = document.createElement('footer');
  foot.textContent = 'Real-time progression. Your save lives in your browser.';
  wrap.appendChild(foot);

  return wrap;
}