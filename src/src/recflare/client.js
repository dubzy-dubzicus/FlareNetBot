import { services, config } from '../config.js';

export class RecFlareError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'RecFlareError';
    this.status = options.status ?? 0;
    this.service = options.service;
    this.path = options.path;
  }
}

export class NotFoundError extends RecFlareError {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'NotFoundError';
  }
}

const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet(key, value) {
  cache.set(key, { expires: Date.now() + config.cacheTtlMs, value });
  return value;
}

async function get(service, path, params = {}, options = {}) {
  const url = new URL(path, services[service]);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item === undefined || item === null || item === '') continue;
      url.searchParams.append(key, String(item));
    }
  }

  const cacheKey = url.toString();
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });

  let response;
  try {
    response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
  } catch {
    const reason = controller.signal.aborted && !options.signal?.aborted ? 'timed out' : 'could not be reached';
    throw new RecFlareError(`RecFlare ${service} ${reason}.`, { service, path });
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', onAbort);
  }

  if (!response.ok) {
    const detail = await response.json().then((body) => body?.error?.message).catch(() => null);
    throw new RecFlareError(detail ?? `${service} replied ${response.status}.`, { status: response.status, service, path });
  }

  const body = await response.json();
  return cacheSet(cacheKey, body);
}

export function isPlaceholderAccount(account) {
  if (!account) return true;
  if (account.username !== `Player${account.accountId}`) return false;
  const created = Date.parse(account.createdAt ?? '');
  return Number.isFinite(created) && Date.now() - created < 5 * 60_000;
}

export async function searchAccounts(name) {
  if (!name?.trim()) return [];
  const results = await get('accounts', '/account/search', { name: name.trim() });
  return Array.isArray(results) ? results : [];
}

export async function getAccount(id) {
  const accountId = Number.parseInt(String(id), 10);
  if (!Number.isFinite(accountId)) throw new NotFoundError(`"${id}" is not a valid account id.`);
  const account = await get('accounts', `/account/${accountId}`);
  if (isPlaceholderAccount(account)) throw new NotFoundError(`No account with id ${accountId}.`, { service: 'accounts' });
  return account;
}

export function getBio(id) {
  return get('accounts', `/account/${id}/bio`);
}

export async function getAccounts(ids) {
  if (ids.length === 0) return [];
  const results = await get('accounts', '/account/bulk', { id: ids });
  return Array.isArray(results) ? results.filter((account) => !isPlaceholderAccount(account)) : [];
}

export async function resolveAccount(query) {
  const trimmed = query.trim();
  if (!trimmed) throw new NotFoundError('Give me a username or an account id.');
  if (/^\d+$/.test(trimmed)) return { account: await getAccount(trimmed) };

  const results = await searchAccounts(trimmed);
  if (results.length === 0) throw new NotFoundError(`No account matches "${trimmed}".`);

  const lowered = trimmed.toLowerCase();
  const exact =
    results.find((account) => account.username.toLowerCase() === lowered) ??
    results.find((account) => (account.displayName ?? '').toLowerCase() === lowered) ??
    results[0];

  return { account: exact, candidates: results };
}

export async function getRoom(id) {
  const roomId = Number.parseInt(String(id), 10);
  if (!Number.isFinite(roomId)) throw new NotFoundError(`"${id}" is not a valid room id.`);
  const room = await get('rooms', `/rooms/${roomId}`);
  if (!room?.RoomId) throw new NotFoundError(`No room with id ${roomId}.`, { service: 'rooms' });
  return room;
}

export async function getRoomByName(name) {
  const room = await get('rooms', '/rooms', { name: name.trim() });
  if (!room?.RoomId) throw new NotFoundError(`No room named "${name}".`, { service: 'rooms' });
  return room;
}

export async function resolveRoom(query) {
  const trimmed = query.trim();
  return /^\d+$/.test(trimmed) ? getRoom(trimmed) : getRoomByName(trimmed);
}

export async function searchRooms(query, options = {}) {
  const result = await get('rooms', '/rooms/search', {
    query: query.trim(),
    skip: options.skip ?? 0,
    take: options.take ?? 10,
  });
  return {
    rooms: Array.isArray(result?.Results) ? result.Results : [],
    total: Number.isFinite(result?.TotalResults) ? result.TotalResults : 0,
  };
}

export async function roomsOwnedBy(accountId) {
  const rooms = await get('rooms', `/rooms/ownedby/${accountId}`);
  return Array.isArray(rooms) ? rooms : [];
}

function normalizePhotoList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.value)) return body.value;
  if (Array.isArray(body?.Results)) return body.Results;
  return [];
}

export async function getPlayerPhotos(playerId, options = {}) {
  const body = await get('api', `/api/images/v5/player/${playerId}`, {
    sort: options.sort,
    skip: options.skip ?? 0,
    take: options.take ?? 25,
  });
  return normalizePhotoList(body);
}

export async function getAllPlayerPhotos(playerId, options = {}) {
  const take = Math.min(Math.max(options.take ?? 50, 1), 100);
  const max = Math.min(Math.max(options.max ?? 200, 1), 500);
  const all = [];
  let skip = options.skip ?? 0;
  while (all.length < max) {
    const batch = await getPlayerPhotos(playerId, { ...options, take, skip });
    if (!batch.length) break;
    all.push(...batch);
    skip += batch.length;
    if (batch.length < take) break;
  }
  return all.slice(0, max);
}

export async function getRoomPhotos(roomId, options = {}) {
  const body = await get('api', `/api/images/v4/room/${roomId}`, {
    skip: options.skip ?? 0,
    take: options.take ?? 25,
  });
  return normalizePhotoList(body);
}

export async function getPhoto(id) {
  const imageId = Number.parseInt(String(id), 10);
  if (!Number.isFinite(imageId)) throw new NotFoundError(`"${id}" is not a valid photo id.`);
  return get('api', `/api/images/v6/${imageId}`);
}

function normalizeEventList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.value)) return body.value;
  if (Array.isArray(body?.Results)) return body.Results;
  return [];
}

export async function getEvents(options = {}) {
  const body = await get('api', '/api/playerevents/v1', {
    take: options.take ?? 10,
    skip: options.skip ?? 0,
  });
  return normalizeEventList(body);
}

export async function getFeaturedRooms() {
  const body = await get('rooms', '/rooms/featured');
  return Array.isArray(body) ? body : normalizeEventList(body);
}
