export function nowMs() { return Date.now(); }
export function seconds(ms) { return Math.floor(ms / 1000); }
export function minutes(ms) { return Math.floor(ms / 60000); }
export function hours(ms) { return Math.floor(ms / 3600000); }

export function formatDuration(ms) {
  if (ms <= 0) return 'done';
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}