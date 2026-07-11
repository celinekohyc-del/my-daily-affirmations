/**
 * Day of the year (1–365). Used to pick "today's affirmation" —
 * affirmations.day_number matches this value. Leap day (366) is clamped to 365
 * so every calendar day maps to a seeded affirmation.
 */
export function dayOfYear(date: Date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor((now - start) / oneDay);
  return Math.min(Math.max(day, 1), 365);
}
