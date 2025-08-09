const UNIT_BY_RESOURCE = {
  food: 'r',
  water: 'L',
  power: 'kWh',
  scrap: 'scrap',
  seeds: 'seeds',
};

function formatAmount(resource, amount) {
  const unit = UNIT_BY_RESOURCE[resource] || resource;
  const isDiscrete = resource === 'scrap' || resource === 'seeds';
  const n = isDiscrete ? Math.round(amount) : Math.round(amount * 10) / 10;
  return `${n} ${unit}`;
}

export function formatCost(cost) {
  if (!cost) return '';
  return Object.entries(cost).map(([k, v]) => formatAmount(k, v)).join(', ');
}

export function formatCostMissing(state, cost) {
  if (!cost) return '';
  const miss = [];
  for (const [k, v] of Object.entries(cost)) {
    const have = state.resources[k] ?? 0;
    if (have < v) miss.push(formatAmount(k, v - have));
  }
  return miss.join(', ');
}