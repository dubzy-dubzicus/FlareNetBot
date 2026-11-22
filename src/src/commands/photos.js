import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { getAllPlayerPhotos, getPlayerPhotos, resolveAccount } from '../recflare/client.js';
import { errorEmbed, photoEmbed, photoSummary } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, truncate } from '../recflare/format.js';
import { config } from '../config.js';
import { hasImage, wideImageUrl } from '../recflare/images.js';

export const data = {
  name: 'photos',
  description: 'Browse RecFlare photos for a user. Can fetch all photos and paginate.',
  options: [
    { type: 3, name: 'user', description: 'Username or account id', required: true },
    { type: 4, name: 'page', description: 'Page number (1-based)', required: false, min_value: 1 },
    { type: 4, name: 'per_page', description: 'Photos per page (1-5)', required: false, min_value: 1, max_value: 5 },
    { type: 5, name: 'all', description: 'Fetch all available photos (up to 500) before paging', required: false },
  ],
};

function pageEmbeds(account, photos, page, perPage) {
  const totalPages = Math.max(1, Math.ceil(photos.length / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;
  const slice = photos.slice(start, start + perPage);
  const embeds = [];
  const first = photoEmbed(slice[0], { owner: account });
  first.setAuthor({ name: `${account.displayName || account.username} • Photos ${start + 1}-${start + slice.length} of ${photos.length}` });
  if (slice.length > 1) {
    first.addFields({ name: `On this page`, value: truncate(slice.slice(1).map(photoSummary).join('\n'), 1024) });
  }
  embeds.push(first);
  for (const photo of slice.slice(1, 4)) {
    if (!hasImage(photo.ImageName)) continue;
    embeds.push(new EmbedBuilder().setURL(`https://${config.domain}/player/${account.accountId}`).setImage(wideImageUrl(photo.ImageName, 1024)));
  }
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('photos:prev').setLabel('Previous').setStyle(ButtonStyle.Secondary).setDisabled(safePage <= 1),
    new ButtonBuilder().setCustomId('photos:next').setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(safePage >= totalPages),
    new ButtonBuilder().setCustomId('photos:info').setLabel(`Page ${safePage}/${totalPages}`).setStyle(ButtonStyle.Primary).setDisabled(true),
  );
  return { embeds: embeds.slice(0, 10), components: [row], page: safePage, totalPages };
}

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('user', true);
  const requestedPage = interaction.options.getInteger('page') ?? 1;
  const perPage = interaction.options.getInteger('per_page') ?? 3;
  const all = interaction.options.getBoolean('all') ?? true;

  try {
    const { account } = await resolveAccount(query);
    const photos = all ? await getAllPlayerPhotos(account.accountId, { max: 500, take: 100 }) : await getPlayerPhotos(account.accountId, { take: 25 });
    if (!photos.length) {
      await interaction.editReply({ embeds: [errorEmbed(`No photos found for ${account.displayName || account.username}.`, 'Photos')] });
      return;
    }

    let state = pageEmbeds(account, photos, requestedPage, perPage);
    const msg = await interaction.editReply({ embeds: state.embeds, components: state.components });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * 60_000 });
    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: 'Only the person who ran this command can change pages.', ephemeral: true });
        return;
      }
      if (i.customId === 'photos:prev') state = pageEmbeds(account, photos, state.page - 1, perPage);
      if (i.customId === 'photos:next') state = pageEmbeds(account, photos, state.page + 1, perPage);
      await i.update({ embeds: state.embeds, components: state.components });
    });
    collector.on('end', async () => {
      try {
        const disabled = [new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('photos:prev').setLabel('Previous').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId('photos:next').setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId('photos:info').setLabel(`Page ${state.page}/${state.totalPages}`).setStyle(ButtonStyle.Primary).setDisabled(true),
        )];
        await msg.edit({ components: disabled });
      } catch {}
    });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
