import { getPhoto, getAccount, getRoom } from '../recflare/client.js';
import { photoEmbed, errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';

export const data = {
  name: 'photo',
  description: 'Look up a RecFlare photo by ID.',
  options: [{ type: 4, name: 'id', description: 'Photo ID', required: true }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const id = interaction.options.getInteger('id', true);
  try {
    const photo = await getPhoto(id);
    const [ownerResult, roomResult] = await Promise.allSettled([
      photo.PlayerId ? getAccount(photo.PlayerId) : Promise.resolve(null),
      photo.RoomId ? getRoom(photo.RoomId) : Promise.resolve(null),
    ]);
    const owner = ownerResult.status === 'fulfilled' ? ownerResult.value : null;
    const room = roomResult.status === 'fulfilled' ? roomResult.value : null;
    await interaction.editReply({ embeds: [photoEmbed(photo, { owner, room })] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
