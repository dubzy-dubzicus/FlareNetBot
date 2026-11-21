export const ACCESSIBILITY = {
  0: { label: 'Private', emoji: '🔒' },
  1: { label: 'Public', emoji: '🌐' },
  2: { label: 'Unlisted', emoji: '🔗' },
};

export const AGE_RATINGS = {
  0: 'Everyone',
  1: 'Mature',
};

export const IMAGE_TYPES = {
  0: 'Photo',
  1: 'Thumbnail',
  2: 'Room image',
};

export function formatPronouns(value) {
  const pronouns = {
    0: 'Unset',
    1: 'She/Her',
    2: 'He/Him',
    3: 'They/Them',
  };
  return pronouns[value] ?? 'Unknown';
}

export function formatIdentity(flags) {
  const names = [];
  if (!flags) return 'Unknown';
  if (flags & 1) names.push('Transgender');
  if (flags & 2) names.push('Non-binary');
  if (flags & 4) names.push('Gender non-conforming');
  return names.length ? names.join(', ') : 'None set';
}

export function formatPlatforms(platforms) {
  const names = [];
  if (!platforms) return 'Unknown';
  if (platforms & 1) names.push('Steam');
  if (platforms & 2) names.push('Meta');
  if (platforms & 4) names.push('PlayStation');
  if (platforms & 8) names.push('Xbox');
  if (platforms & 16) names.push('Mobile');
  if (platforms & 32) names.push('Nintendo');
  if (platforms & 64) names.push('Pico');
  return names.length ? names.join(', ') : 'None listed';
}
