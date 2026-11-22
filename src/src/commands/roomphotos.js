import { EmbedBuilder } from 'discord.js';
import { getRoomPhotos, resolveRoom } from '../recflare/client.js';
import { errorEmbed, photoEmbed, photoSummary } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { truncate } from '../recflare/format.js';
import { config } from '../config.js';
import { hasImage, wideImageUrl } from '../recflare/images.js';

export const data = {
  name: 'roomphotos',
  description: 'Show recent photos taken in a Rec Room room.',
  options: [
    { type: 3, name: 'room', description: 'Room name or room ID', required: true },
    { type: 4, name: 'count', description: 'How many photos (1-5)', required: false, min_value: 1, max_value: 5 },
  ],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('room', true);
  const count = interaction.options.getInteger('count') ?? 3;
  try {
    const room = await resolveRoom(query);
    const photos = await getRoomPhotos(room.RoomId, { take: count });
    if (!photos.length) {
      await interaction.editReply({ embeds: [errorEmbed(`No photos found for ${room.Name}.`, 'Room Photos')] });
      return;
    }
    const embeds = [];
    const first = photoEmbed(photos[0], { room });
    if (photos.length > 1) first.addFields({ name: `More photos (${photos.length - 1})`, value: truncate(photos.slice(1).map(photoSummary).join('\n'), 1024) });
    embeds.push(first);
    for (const photo of photos.slice(1, 4)) {
      if (!hasImage(photo.ImageName)) continue;
      embeds.push(new EmbedBuilder().setURL(`https://${config.domain}/room/${room.RoomId}`).setImage(wideImageUrl(photo.ImageName, 1024)));
    }
    await interaction.editReply({ embeds: embeds.slice(0, 10) });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
