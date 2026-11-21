import { resolveRoom, getAccount } from '../recflare/client.js';
import { roomEmbed, errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';

export const data = {
  name: 'room',
  description: 'Look up a RecFlare room by name or room ID.',
  options: [{ type: 3, name: 'query', description: 'Room name or room ID', required: true }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('query', true);
  try {
    const room = await resolveRoom(query);
    let creator;
    try { creator = await getAccount(room.CreatorAccountId); } catch { creator = null; }
    await interaction.editReply({ embeds: [roomEmbed(room, { creator })] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
