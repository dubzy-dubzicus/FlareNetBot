import { EmbedBuilder } from 'discord.js';
import { getFeaturedRooms } from '../recflare/client.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, num, truncate } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'featured',
  description: 'Show featured Rec Room rooms from RecFlare.',
};

export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const rooms = await getFeaturedRooms();
    if (!rooms.length) {
      await interaction.editReply({ embeds: [errorEmbed('No featured rooms were returned.', 'Featured')] });
      return;
    }
    const lines = rooms.slice(0, 15).map((r) => `• **${truncate(r.Name, 50)}** (ID \`${r.RoomId}\`) — ${num(r.Stats?.VisitCount)} visits`);
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle('Featured Rooms')
      .setDescription(truncate(lines.join('\n'), 4096))
      .setFooter(footer(`RecFlare • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
