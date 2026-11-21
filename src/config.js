/**
 * Bot configuration, read once from the environment.
 */

try {
  process.loadEnvFile();
} catch {
  // No .env file; use ambient environment.
}

const color = process.env.RECFLARE_COLOR ?? '#5865F2';

export const config = {
  token: process.env.DISCORD_TOKEN ?? '',
  applicationId: process.env.DISCORD_APPLICATION_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',

  domain: (process.env.RECFLARE_DOMAIN ?? 'recflare.net').replace(/^https?:\/\//, '').replace(/\/+$/, ''),
  timeoutMs: Number(process.env.RECFLARE_TIMEOUT_MS ?? 10_000),
  cacheTtlMs: Number(process.env.RECFLARE_CACHE_TTL_MS ?? 60_000),

  color: /^#?[0-9a-f]{6}$/i.test(color) ? parseInt(color.replace('#', ''), 16) : 0x5865f2,
};

export const services = {
  accounts: `https://accounts.${config.domain}`,
  rooms: `https://rooms.${config.domain}`,
  api: `https://api.${config.domain}`,
  img: `https://img.${config.domain}`,
};
