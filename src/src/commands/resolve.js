import { EmbedBuilder } from 'discord.js';
import { resolveAccount, resolveRoom } from '../recflare/client.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, truncate } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'resolve',
  description: 'Resolve a username/room name to IDs and quick links.',
  options: [
    { type: 3, name: 'type', description: 'What to resolve', required: true, choices: [{ name: 'user', value: 'user' }, { name: 'room', value: 'room' }] },
    { type: 3, name: 'query', description: 'Username, account ID, room name, or room ID', required: true },
  ],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const type = interaction.options.getString('type', true);
  const query = interaction.options.getString('query', true);
  try {
    if (type === 'user') {
      const { account } = await resolveAccount(query);
      const embed = new EmbedBuilder()
        .setColor(color())
        .setTitle(`${account.displayName || account.username}`)
        .setDescription([
          `**Username:** ${account.username}`,
          `**Account ID:** \`${account.accountId}\``,
          `**Profile:** https://${config.domain}/player/${account.accountId}`,
        ].join('\n'))
        .setFooter(footer(`RecFlare • ${config.domain}`));
      await interaction.editReply({ embeds: [embed] });
      return;
    }
    const room = await resolveRoom(query);
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle(truncate(room.Name, 256))
      .setDescription([
        `**Room ID:** \`${room.RoomId}\``,
        `**Creator ID:** \`${room.CreatorAccountId}\``,
        `**Room:** https://${config.domain}/room/${room.RoomId}`,
      ].join('\n'))
      .setFooter(footer(`RecFlare • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
