// The backend's seeded lookup names (sex, marital status, etc.) come back in
// ALL CAPS ("MALE", "MARRIED"), which reads like shouting in the UI. This
// reformats a value for *display only* — comparisons elsewhere against the
// raw value (e.g. checking a marital status name === 'MARRIED') should keep
// using the original string, not this.
export function toDisplayLabel(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}
