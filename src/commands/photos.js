import { EmbedBuilder } from 'discord.js';
import { resolveAccount, getPlayerPhotos } from '../recflare/client.js';
import { errorEmbed, photoEmbed, photoSummary } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, truncate } from '../recflare/format.js';
import { config } from '../config.js';
import { hasImage, wideImageUrl } from '../recflare/images.js';

export const data = {
  name: 'photos',
  description: 'Show recent RecFlare photos for a user.',
  options: [
    { type: 3, name: 'user', description: 'Username or account id', required: true },
    { type: 4, name: 'count', description: 'How many photos to list (1-5)', required: false, min_value: 1, max_value: 5 },
  ],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('user', true);
  const count = interaction.options.getInteger('count') ?? 3;

  try {
    const { account } = await resolveAccount(query);
    const photos = await getPlayerPhotos(account.accountId, { take: count });
    if (!photos.length) {
      await interaction.editReply({ embeds: [errorEmbed(`No photos found for ${account.displayName || account.username}.`, 'Photos')] });
      return;
    }

    // Show first photo as rich embed, list others in description if multiple
    const embeds = [];
    const first = photoEmbed(photos[0], { owner: account });
    if (photos.length > 1) {
      const rest = photos.slice(1).map(photoSummary).join('\n');
      first.addFields({ name: `More recent photos (${photos.length - 1})`, value: truncate(rest, 1024) });
    }
    embeds.push(first);

    // Optionally add image-only embeds for additional photos (Discord allows up to 10 embeds)
    for (const photo of photos.slice(1, 4)) {
      if (!hasImage(photo.ImageName)) continue;
      embeds.push(
        new EmbedBuilder()
          .setURL(`https://${config.domain}/player/${account.accountId}`)
          .setImage(wideImageUrl(photo.ImageName, 1024)),
      );
    }

    await interaction.editReply({ embeds: embeds.slice(0, 10) });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
