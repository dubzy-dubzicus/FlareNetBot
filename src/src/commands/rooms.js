import { EmbedBuilder } from 'discord.js';
import { searchRooms } from '../recflare/client.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, num, truncate } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'rooms',
  description: 'Search RecFlare rooms by name or tag query.',
  options: [{ type: 3, name: 'query', description: 'Search query (name or #tag)', required: true }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('query', true).trim();
  try {
    const { rooms, total } = await searchRooms(query, { take: 10 });
    if (!rooms.length) {
      await interaction.editReply({ embeds: [errorEmbed(`No rooms match "${query}".`, 'Rooms')] });
      return;
    }

    const lines = rooms.map((r) => `• **${truncate(r.Name, 50)}** (ID \`${r.RoomId}\`) — ${num(r.Stats?.VisitCount)} visits, ${num(r.Stats?.CheerCount)} cheers`);
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle(`Room search: ${truncate(query, 100)}`)
      .setDescription(truncate(lines.join('\n'), 4096))
      .setFooter(footer(`${Math.min(rooms.length, total)} shown of ${total} • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
