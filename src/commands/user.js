import { getBio, resolveAccount, roomsOwnedBy } from '../recflare/client.js';
import { accountEmbed, errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';

export const data = {
  name: 'user',
  description: 'Show a RecFlare profile: avatar, bio, pronouns, identity and platforms.',
  options: [
    { type: 3, name: 'query', description: 'Username or account id', required: true },
    { type: 5, name: 'rooms', description: "Also list the player's public rooms", required: false },
  ],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('query', true);
  const withRooms = interaction.options.getBoolean('rooms') ?? false;

  try {
    const { account } = await resolveAccount(query);
    const [bioResult, roomsResult] = await Promise.allSettled([
      getBio(account.accountId),
      withRooms ? roomsOwnedBy(account.accountId) : Promise.resolve([]),
    ]);

    const bio = bioResult.status === 'fulfilled' ? bioResult.value?.bio : '';
    const rooms = roomsResult.status === 'fulfilled' ? roomsResult.value : [];
    await interaction.editReply({ embeds: [accountEmbed(account, { bio, rooms })] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
