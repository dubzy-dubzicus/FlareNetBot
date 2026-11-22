import { EmbedBuilder } from 'discord.js';
import { color, footer } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'help',
  description: 'Show available RecFlare bot commands.',
};

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(color())
    .setTitle('RecFlare Discord Bot')
    .setDescription('Browse RecFlare users, rooms, and photos from Discord.')
    .addFields(
      { name: '/user', value: 'Look up a user profile (pronouns, identity, platforms, bio option).' },
      { name: '/bio', value: 'Show a user bio.' },
      { name: '/search', value: 'Search accounts by username prefix.' },
      { name: '/resolve', value: 'Resolve a user/room name to IDs and links.' },
      { name: '/room', value: 'Look up a room by name or room ID.' },
      { name: '/rooms', value: 'Search rooms by name/tag query.' },
      { name: '/roomphotos', value: 'Show recent photos taken in a room.' },
      { name: '/photo', value: 'Look up a single photo by ID.' },
      { name: '/photos', value: 'Browse all photos for a user with pagination.' },
      { name: '/events', value: 'Show upcoming player events.' },
      { name: '/featured', value: 'Show featured rooms.' },
    )
    .setFooter(footer(`RecFlare • ${config.domain}`));
  await interaction.reply({ embeds: [embed] });
}
