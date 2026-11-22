import { services } from '../config.js';

export const AVATAR_SIZES = [128, 256, 512, 1024];
export const AVATAR_SIZE = 256;
export const WIDE_SIZE = 512;
export const DEFAULT_AVATAR = 'DefaultProfileImage.jpg';

export function hasImage(key) {
  return typeof key === 'string' && key.trim().length > 0;
}

function encodeKey(key) {
  return key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

export function imageUrl(key, options = {}) {
  if (!key) return null;
  const url = new URL(encodeKey(key), services.img);
  if (options.width && AVATAR_SIZES.includes(options.width)) url.searchParams.set('width', String(options.width));
  if (options.cropSquare) url.searchParams.set('cropSquare', '1');
  return url.toString();
}

export function avatarUrl(key, size = AVATAR_SIZE) {
  return imageUrl(key, { width: size, cropSquare: true });
}

export function wideImageUrl(key, size = WIDE_SIZE) {
  return imageUrl(key, { width: size });
}

export function avatarUrlOrDefault(key, size = AVATAR_SIZE) {
  return avatarUrl(hasImage(key) ? key : DEFAULT_AVATAR, size);
}
