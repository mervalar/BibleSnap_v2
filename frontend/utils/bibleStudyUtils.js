/** Build day schedule: distribute reading days across totalDays. */
export function buildSchedule(readings, totalDays) {
  const items = readings.slice().sort((a, b) => a.day - b.day);
  const n = items.length;
  const base = Math.floor(n / totalDays);
  const rem = n % totalDays;
  const schedule = [];
  let idx = 0;
  for (let i = 0; i < totalDays; i++) {
    const size = base + (i < rem ? 1 : 0);
    schedule.push(items.slice(idx, idx + size).map((r) => r.day));
    idx += size;
  }
  return schedule;
}
