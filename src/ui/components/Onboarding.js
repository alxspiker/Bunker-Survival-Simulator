import { scenarioList } from '../../game/scenarios.js';

export function Onboarding({ onComplete }) {
  const wrap = document.createElement('div');
  wrap.className = 'card';

  const title = document.createElement('h1');
  title.className = 'h';
  title.textContent = 'Bunker Survival Simulator';

  const subtitle = document.createElement('div');
  subtitle.className = 'small';
  subtitle.textContent = 'Choose your scenario and enter your name to begin. Progress is real-time and saved in your browser.';

  const form = document.createElement('div');
  form.className = 'grid';

  const nameGroup = document.createElement('div');
  nameGroup.innerHTML = `
    <label for="name">Name</label>
    <input id="name" type="text" placeholder="Your name" />
  `;

  const scenarioGroup = document.createElement('div');
  const select = document.createElement('select');
  select.id = 'scenario';
  for (const s of scenarioList) {
    const opt = document.createElement('option');
    opt.value = s.key;
    opt.textContent = `${s.name}`;
    select.appendChild(opt);
  }
  scenarioGroup.innerHTML = '<label>Scenario</label>';
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

  form.appendChild(nameGroup);
  form.appendChild(scenarioGroup);

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  wrap.appendChild(form);
  wrap.appendChild(desc);
  wrap.appendChild(document.createElement('hr')).className = 'sep';
  wrap.appendChild(start);

  return wrap;
}