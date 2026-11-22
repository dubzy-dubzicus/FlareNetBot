/**
 * Decoders for RecFlare account bitmasks.
 *
 * PlatformType is known from RecFlare source. Pronoun/identity bit labels are
 * partially known; unknown set bits are surfaced as ?bitN instead of guessed.
 */

// Pronoun bit labels are not officially published by RecFlare. This mapping is
// evidence-based (e.g. personalPronouns=6 => He/Him, They/Them) and may need
// adjustment if Rec Room/RecFlare exposes different bit assignments.
export const PRONOUN_BITS = [
  { bit: 0, label: 'She/Her' },
  { bit: 1, label: 'He/Him' },
  { bit: 2, label: 'They/Them' },
  { bit: 3, label: 'Ze/Zir' },
  { bit: 4, label: 'Xe/Xem' },
  { bit: 5, label: 'Any pronouns' },
];

// Identity bit labels are not officially published by RecFlare. This mapping
// is evidence-based and may need refinement; unknown bits still shown explicitly.
export const IDENTITY_BITS = [
  { bit: 0, label: 'Man' },
  { bit: 1, label: 'Woman' },
  { bit: 2, label: 'Bisexual' },
  { bit: 3, label: 'Gay' },
  { bit: 4, label: 'Lesbian' },
  { bit: 5, label: 'Transgender' },
  { bit: 6, label: 'Non-binary' },
  { bit: 7, label: 'Asexual' },
  { bit: 8, label: 'Pansexual' },
  { bit: 9, label: 'Questioning' },
];

export const PLATFORM_BITS = [
  { bit: 0, label: 'Steam' },
  { bit: 1, label: 'Oculus' },
  { bit: 2, label: 'PlayStation' },
  { bit: 3, label: 'Xbox' },
  { bit: 4, label: 'RecNet' },
  { bit: 5, label: 'iOS' },
  { bit: 6, label: 'Google Play' },
  { bit: 7, label: 'Standalone' },
  { bit: 8, label: 'Pico' },
];

export const DISCORD_PLATFORM_VALUE = 101;

export const ACCESSIBILITY = {
  0: { label: 'Private', emoji: '🔒' },
  1: { label: 'Public', emoji: '🌐' },
  2: { label: 'Unlisted', emoji: '🔗' },
  3: { label: 'Developer only', emoji: '🛠️' },
  4: { label: 'Developer unlisted', emoji: '🛠️' },
};

export const IMAGE_TYPES = {
  0: 'Unknown',
  1: 'Share camera',
  2: 'Screenshot',
  3: 'Room',
  4: 'Profile',
};

export const AGE_RATINGS = {
  0: 'Everyone',
  1: '9+',
  2: '13+',
  3: '16+',
  4: '18+',
};

export function decodeMask(mask, table) {
  const value = Number.isFinite(mask) ? mask : 0;
  const labels = [];
  const unknown = [];
  const bits = [];
  for (const { bit, label } of table) {
    if ((value & (1 << bit)) === 0) continue;
    bits.push(bit);
    if (label) labels.push(label);
    else unknown.push(bit);
  }
  return { labels, unknown, bits };
}

export function formatMask(mask, table, options = {}) {
  const { empty = 'Not set', unknownPrefix = '?bit' } = options;
  const { labels, unknown } = decodeMask(mask, table);
  const parts = [...labels, ...unknown.map((bit) => `${unknownPrefix}${bit}`)];
  return parts.length > 0 ? parts.join(', ') : empty;
}

export function formatPronouns(mask) {
  const value = Number.isFinite(mask) ? mask : 0;
  if (value === 0) return 'Not set';
  const { labels, unknown } = decodeMask(value, PRONOUN_BITS);
  const parts = [...labels, ...unknown.map((bit) => `Unknown (bit ${bit})`)];
  return parts.length > 0 ? parts.join(', ') : 'Not set';
}

export function formatIdentity(mask) {
  const value = Number.isFinite(mask) ? mask : 0;
  if (value === 0) return 'Not set';
  const { labels, unknown } = decodeMask(value, IDENTITY_BITS);
  const parts = [...labels, ...unknown.map((bit) => `Unknown (bit ${bit})`)];
  return parts.length > 0 ? parts.join(', ') : 'Not set';
}

export function decodePlatforms(mask) {
  const value = Number.isFinite(mask) ? mask : 0;
  const discord = value === DISCORD_PLATFORM_VALUE;
  const rest = discord ? 0 : value;
  const { labels } = decodeMask(rest, PLATFORM_BITS);
  return { labels, discord };
}

export function formatPlatforms(mask) {
  const { labels, discord } = decodePlatforms(mask);
  const parts = discord ? ['Discord', ...labels] : labels;
  return parts.length > 0 ? parts.join(', ') : 'None linked';
}
