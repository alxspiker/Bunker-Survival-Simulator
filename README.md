# Bunker Survival Simulator (Web/Text-Based)

A modular, real-time survival idle/sim in the browser. All data is stored locally in your browser (localStorage). Choose a scenario, enter your bunker, and slowly bring systems online.

## Features
- Real-time progression tied to wall-clock time (offline progress supported)
- Three scenarios: Post-Nuclear War, Zombie Outbreak, Overpopulation Crisis
- Slow, long-duration tasks (e.g., building rooms takes hours)
- Modular ES modules structure, no framework required
- All data stored in localStorage

## Run
Open `index.html` in a modern browser or serve the folder with a static server:

```bash
npx http-server .
```

## Structure
- `index.html`: root HTML
- `styles.css`: minimal UI styling
- `src/main.js`: app bootstrap
- `src/storage.js`: persistence layer
- `src/state.js`: state model and helpers
- `src/utils/time.js`: time helpers and formatting
- `src/game/scenarios.js`: scenario definitions
- `src/game/gameEngine.js`: real-time tick + offline processing
- `src/game/actions.js`: available actions and scheduling
- `src/ui/router.js`: simple view switching
- `src/ui/components/*`: UI components

## Notes
- Progress continues while the tab is closed, processed on next launch (capped to 7 days per reopen).
- This is a baseline to iterate on (expeditions, hazards, events, more rooms/upgrades).