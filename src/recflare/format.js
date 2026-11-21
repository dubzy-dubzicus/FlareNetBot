import { config } from '../config.js';

const FIELD_LIMIT = 1024;

export function truncate(value, limit = FIELD_LIMIT) {
  const text = String(value ?? '').trim();
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped}…`;
}

export function field(value) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

export function singleLine(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function timestamp(iso, includeTime = false) {
  const value = Date.parse(iso ?? '');
  if (!Number.isFinite(value)) return 'Unknown';
  return `<t:${Math.floor(value / 1000)}:${includeTime ? 'f' : 'd'}>`;
}

export function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('en-US') : '0';
}

export function color() {
  return config.color;
}

export function footer(text) {
  return { text: truncate(text, 2048) };
}
