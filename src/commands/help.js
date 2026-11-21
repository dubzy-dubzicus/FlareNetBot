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
      { name: '/user', value: 'Look up a user by username or account ID.' },
      { name: '/search', value: 'Search accounts by username prefix.' },
      { name: '/room', value: 'Look up a room by name or room ID.' },
      { name: '/rooms', value: 'Search rooms by name/tag query.' },
      { name: '/photo', value: 'Look up a single photo by ID.' },
      { name: '/photos', value: 'Show recent photos for a user.' },
    )
    .setFooter(footer(`RecFlare • ${config.domain}`));
  await interaction.reply({ embeds: [embed] });
}
