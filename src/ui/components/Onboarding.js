import { scenarioList } from '../../game/scenarios.js';

export function Onboarding({ onComplete }) {
  const wrap = document.createElement('div');
  wrap.className = 'card setup-card';

  const title = document.createElement('h1');
  title.className = 'h';
  title.textContent = 'Bunker Survival Simulator';

  const subtitle = document.createElement('div');
  subtitle.className = 'small';
  subtitle.textContent = 'Choose a scenario and your survivor name. Progress runs in real-time and saves locally.';

  const flex = document.createElement('div');
  flex.className = 'setup-flex';

  const nameGroup = document.createElement('div');
  nameGroup.className = 'setup-field';
  nameGroup.innerHTML = `
    <label for="name">Survivor name</label>
    <input id="name" type="text" placeholder="Your name" />
  `;

  const scenarioGroup = document.createElement('div');
  scenarioGroup.className = 'setup-field';
  const select = document.createElement('select');
  select.id = 'scenario';
  for (const s of scenarioList) {
    const opt = document.createElement('option');
    opt.value = s.key;
    opt.textContent = `${s.name}`;
    select.appendChild(opt);
  }
  const scenLabel = document.createElement('label');
  scenLabel.textContent = 'Scenario';
  scenarioGroup.appendChild(scenLabel);
  scenarioGroup.appendChild(select);

  const desc = document.createElement('div');
  desc.className = 'small meta';
  const setDesc = () => {
    const s = scenarioList.find(x => x.key === select.value);
    desc.textContent = s?.description || '';
  };
  select.addEventListener('change', setDesc);
  setDesc();

  const start = document.createElement('button');
  start.className = 'btn';
  start.textContent = 'Enter Bunker';
  start.addEventListener('click', () => {
    const name = wrap.querySelector('#name').value.trim() || 'Survivor';
    const scenarioKey = select.value;
    onComplete?.({ name, scenarioKey });
  });

  flex.appendChild(nameGroup);
  flex.appendChild(scenarioGroup);

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  wrap.appendChild(flex);
  wrap.appendChild(desc);
  wrap.appendChild(start);

  return wrap;
}