import { EmbedBuilder } from 'discord.js';
import { searchAccounts } from '../recflare/client.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, truncate } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'search',
  description: 'Search RecFlare accounts by username prefix.',
  options: [{ type: 3, name: 'query', description: 'Username to search for', required: true }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('query', true).trim();
  try {
    const results = await searchAccounts(query);
    if (!results.length) {
      await interaction.editReply({ embeds: [errorEmbed(`No accounts match "${query}".`, 'Search')] });
      return;
    }

    const lines = results.slice(0, 20).map((a) => `• **${truncate(a.displayName || a.username, 40)}** (@${a.username}) — ID \`${a.accountId}\``);
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle(`Account search: ${truncate(query, 100)}`)
      .setDescription(truncate(lines.join('\n'), 4096))
      .setFooter(footer(`RecFlare • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
