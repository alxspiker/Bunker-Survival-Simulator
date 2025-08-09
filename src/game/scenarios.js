export const scenarios = {
  nuclear: {
    key: 'nuclear',
    name: 'Post-Nuclear War',
    description: 'The world burned. Ash clouds block the sun. Surface is irradiated and silent.',
    starting: { food: 10, water: 12, power: 5, seeds: 4, scrap: 8, population: 3, morale: 60 },
  },
  zombies: {
    key: 'zombies',
    name: 'Zombie Outbreak',
    description: 'The infected roam the cities. Noise attracts them. Quiet is survival.',
    starting: { food: 8, water: 10, power: 4, seeds: 3, scrap: 10, population: 4, morale: 55 },
  },
  overpop: {
    key: 'overpop',
    name: 'Overpopulation Crisis',
    description: 'Resources collapsed under demand. You retreated underground to endure the scarcity.',
    starting: { food: 12, water: 12, power: 6, seeds: 5, scrap: 6, population: 5, morale: 50 },
  },
};

export const scenarioList = Object.values(scenarios);