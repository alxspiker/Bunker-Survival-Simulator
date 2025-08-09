const STORAGE_KEY = 'bunker.save.v1';

export function hasExistingSave() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to load state', err);
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state', err);
  }
}

export function updateState(mutator) {
  const current = loadState() || {};
  const updated = mutator({ ...current });
  saveState(updated);
  return updated;
}