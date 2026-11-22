import { resolveAccount, getBio } from '../recflare/client.js';
import { EmbedBuilder } from 'discord.js';
import { color, footer, truncate } from '../recflare/format.js';
import { config } from '../config.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';

export const data = {
  name: 'bio',
  description: 'Show a RecFlare user bio.',
  options: [{ type: 3, name: 'user', description: 'Username or account id', required: true }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('user', true);
  try {
    const { account } = await resolveAccount(query);
    const bio = await getBio(account.accountId).catch(() => ({ bio: '' }));
    const text = String(bio?.bio ?? '').trim();
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle(`${account.displayName || account.username} — Bio`)
      .setURL(`https://${config.domain}/player/${account.accountId}`)
      .setDescription(text ? truncate(text, 4096) : 'No bio set.')
      .setFooter(footer(`RecFlare • Account ${account.accountId} • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
