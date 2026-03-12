/** Format an ISO date string to a readable form, e.g. "Mar 7, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Truncate text to a maximum character length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Capitalise the first letter of a string */
export function capitalise(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Generate a random hex colour */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

/** Deep-clone a JSON-serialisable value */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
