export function nowMs() { return Date.now(); }
export function seconds(ms) { return Math.floor(ms / 1000); }
export function minutes(ms) { return Math.floor(ms / 60000); }
export function hours(ms) { return Math.floor(ms / 3600000); }

export function formatDuration(ms) {
  if (ms == null) return '—';
  if (!isFinite(ms)) return '—';
  if (ms <= 0) return 'done';
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}

export function timeToBoundary(current, ratePerHour, minBound, maxBound) {
  if (!isFinite(ratePerHour) || ratePerHour === 0) return null;
  if (ratePerHour > 0) {
    if (!isFinite(maxBound)) return null;
    if (current >= maxBound) return null;
    const hoursLeft = (maxBound - current) / ratePerHour;
    if (hoursLeft < 0) return null;
    return hoursLeft * 3600_000;
  }
  // ratePerHour < 0
  if (!isFinite(minBound)) return null;
  if (current <= minBound) return null;
  const hoursLeft = (current - minBound) / (-ratePerHour);
  if (hoursLeft < 0) return null;
  return hoursLeft * 3600_000;
}