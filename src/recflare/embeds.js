import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';
import { ACCESSIBILITY, AGE_RATINGS, IMAGE_TYPES, formatIdentity, formatPlatforms, formatPronouns } from './flags.js';
import { avatarUrlOrDefault, hasImage, wideImageUrl } from './images.js';
import { color, field, footer, num, singleLine, timestamp, truncate } from './format.js';

const SOURCE = config.domain;
const DESCRIPTION_LIMIT = 4096;

export function accountEmbed(account, extras = {}) {
  const embed = new EmbedBuilder()
    .setColor(color())
    .setTitle(truncate(`${account.displayName || account.username}${account.displayEmoji ?? ''}`, 256))
    .setURL(`https://${config.domain}/player/${account.accountId}`)
    .setThumbnail(avatarUrlOrDefault(account.profileImage));

  if (hasImage(account.bannerImage)) embed.setImage(wideImageUrl(account.bannerImage, 1024));

  embed.addFields(
    [
      { name: 'Username', value: field(account.username) ?? 'Unknown', inline: true },
      { name: 'Account ID', value: field(String(account.accountId)) ?? 'Unknown', inline: true },
      { name: 'Pronouns', value: field(formatPronouns(account.personalPronouns)) ?? 'Unknown', inline: true },
      { name: 'Identity', value: field(formatIdentity(account.identityFlags)) ?? 'Unknown', inline: true },
      { name: 'Platforms', value: field(formatPlatforms(account.platforms)) ?? 'Unknown', inline: true },
      { name: 'Joined', value: field(timestamp(account.createdAt)) ?? 'Unknown', inline: true },
      account.isJunior ? { name: 'Account', value: 'Junior account', inline: true } : null,
    ].filter(Boolean),
  );

  const bio = singleLine(extras.bio);
  if (bio) embed.setDescription(truncate(bio, DESCRIPTION_LIMIT));

  if (extras.rooms?.length) {
    const listed = extras.rooms
      .slice(0, 5)
      .map((room) => `• **${truncate(singleLine(room.Name), 60)}** — ${num(room.Stats?.VisitCount)} visits`)
      .join('\n');
    embed.addFields({ name: `Rooms (${extras.rooms.length})`, value: truncate(listed) });
  }

  embed.setFooter(footer(`RecFlare • Account ${account.accountId} • ${SOURCE}`));
  return embed;
}

function roomPlatforms(room) {
  const supported = [
    ['Screens', room.SupportsScreens],
    ['Quest 2', room.SupportsQuest2],
    ['Mobile', room.SupportsMobile],
    ['Walk VR', room.SupportsWalkVR],
    ['Teleport VR', room.SupportsTeleportVR],
    ['VR Low', room.SupportsVRLow],
  ].filter(([, on]) => on);
  return supported.length > 0 ? supported.map(([name]) => name).join(', ') : 'None declared';
}

function roomTags(room) {
  if (!Array.isArray(room.Tags) || room.Tags.length === 0) return null;
  const primary = room.Tags.find((tag) => tag.IsPrimaryGenre) ?? room.Tags[0];
  const rest = room.Tags.filter((tag) => tag !== primary);
  const leading = `#${primary.Tag}`;
  return rest.length > 0 ? [leading, ...rest.map((tag) => `#${tag.Tag}`)].join(' ') : leading;
}

export function roomEmbed(room, extras = {}) {
  const embed = new EmbedBuilder()
    .setColor(color())
    .setTitle(truncate(room.Name || `Room ${room.RoomId}`, 256))
    .setURL(`https://${config.domain}/room/${room.RoomId}`);

  if (hasImage(room.ImageName)) embed.setImage(wideImageUrl(room.ImageName, 1024));

  const description = singleLine(room.Description);
  if (description) embed.setDescription(truncate(description));

  const accessibility = ACCESSIBILITY[room.Accessibility];
  embed.addFields(
    [
      { name: 'Stats', value: [`${num(room.Stats?.VisitCount)} visits`, `${num(room.Stats?.VisitorCount)} unique`, `${num(room.Stats?.CheerCount)} cheers`, `${num(room.Stats?.FavoriteCount)} favorites`].join('\n'), inline: true },
      { name: 'Room', value: [accessibility ? `${accessibility.emoji} ${accessibility.label}` : null, `Max ${num(room.MaxPlayers)} players`, AGE_RATINGS[room.AgeRating] ? `Rated ${AGE_RATINGS[room.AgeRating]}` : null, room.IsDorm ? 'Dorm/personal room' : null].filter(Boolean).join('\n') || 'Unknown', inline: true },
      { name: 'Platforms', value: field(roomPlatforms(room)) ?? 'Unknown', inline: true },
      { name: 'Creator', value: extras.creator ? `${extras.creator.displayName || extras.creator.username} (\`${extras.creator.username}\`)` : `Account ${room.CreatorAccountId}`, inline: true },
      { name: 'Room ID', value: String(room.RoomId), inline: true },
      { name: 'Published', value: timestamp(room.PublishedAt ?? room.CreatedAt), inline: true },
    ].filter(Boolean),
  );

  if (room.CCU) embed.addFields({ name: 'Live now', value: `${num(room.CCU)} playing`, inline: true });
  const tags = roomTags(room);
  if (tags) embed.addFields({ name: 'Tags', value: truncate(tags) });

  embed.setFooter(footer(`RecFlare • Room ${room.RoomId} • ${SOURCE}`));
  return embed;
}

export function photoEmbed(photo, extras = {}) {
  const embed = new EmbedBuilder().setColor(color()).setTitle(truncate(`Photo #${photo.SavedImageId ?? photo.Id}`, 256));
  if (hasImage(photo.ImageName)) {
    const url = wideImageUrl(photo.ImageName, 1024);
    embed.setImage(url);
    embed.setURL(url);
  }

  const description = singleLine(photo.Description);
  if (description) embed.setDescription(truncate(description));

  embed.addFields(
    [
      { name: 'Taken', value: `${timestamp(photo.CreatedAt, true)}`, inline: true },
      { name: 'Type', value: field(IMAGE_TYPES[photo.SavedImageType ?? photo.Type] ?? 'Unknown') ?? 'Unknown', inline: true },
      { name: 'Cheers', value: field(num(photo.CheerCount)) ?? '0', inline: true },
      photo.CommentCount ? { name: 'Comments', value: num(photo.CommentCount), inline: true } : null,
      extras.owner ? { name: 'Photographer', value: `${extras.owner.displayName || extras.owner.username} (\`${extras.owner.username}\`)`, inline: true } : { name: 'Photographer', value: `Account ${photo.PlayerId}`, inline: true },
      extras.room ? { name: 'Room', value: truncate(singleLine(extras.room.Name), 200), inline: true } : null,
    ].filter(Boolean),
  );

  embed.setFooter(footer(`RecFlare • Photo ${photo.SavedImageId ?? photo.Id} • ${SOURCE}`));
  return embed;
}

export function photoSummary(photo) {
  const description = singleLine(photo.Description);
  const bits = [
    `#${photo.SavedImageId ?? photo.Id}`,
    timestamp(photo.CreatedAt),
    photo.CheerCount ? `${num(photo.CheerCount)} cheers` : null,
    description ? `"${truncate(description, 80)}"` : null,
  ].filter(Boolean);
  return truncate(`• ${bits.join(' • ')}`, 1024);
}

export function errorEmbed(message, title = 'RecFlare') {
  return new EmbedBuilder().setColor(0xed4245).setTitle(title).setDescription(truncate(message, 1024));
}
