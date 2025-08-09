export const scenarios = {
  nuclear: {
    key: 'nuclear',
    name: 'Post-Nuclear War',
    description: 'The world burned. Ash clouds block the sun. Surface is irradiated and silent.',
    starting: { food: 6, water: 16, power: 8, seeds: 4, scrap: 8, population: 1, morale: 60 },
  },
  zombies: {
    key: 'zombies',
    name: 'Zombie Outbreak',
    description: 'The infected roam the cities. Noise attracts them. Quiet is survival.',
    starting: { food: 6, water: 16, power: 8, seeds: 3, scrap: 10, population: 1, morale: 55 },
  },
  overpop: {
    key: 'overpop',
    name: 'Overpopulation Crisis',
    description: 'Resources collapsed under demand. You retreated underground to endure the scarcity.',
    starting: { food: 6, water: 16, power: 8, seeds: 5, scrap: 6, population: 1, morale: 50 },
  },
};

export const scenarioList = Object.values(scenarios);