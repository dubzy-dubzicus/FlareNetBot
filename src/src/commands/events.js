import { EmbedBuilder } from 'discord.js';
import { getEvents } from '../recflare/client.js';
import { errorEmbed } from '../recflare/embeds.js';
import { describeError } from './helpers.js';
import { color, footer, num, timestamp, truncate } from '../recflare/format.js';
import { config } from '../config.js';

export const data = {
  name: 'events',
  description: 'Show upcoming RecFlare/Rec Room player events.',
  options: [{ type: 4, name: 'count', description: 'How many events (1-10)', required: false, min_value: 1, max_value: 10 }],
};

export async function execute(interaction) {
  await interaction.deferReply();
  const count = interaction.options.getInteger('count') ?? 5;
  try {
    const events = await getEvents({ take: count });
    if (!events.length) {
      await interaction.editReply({ embeds: [errorEmbed('No events found.', 'Events')] });
      return;
    }
    const lines = events.map((e) => {
      const name = truncate(e.Name || `Event ${e.PlayerEventId}`, 60);
      const when = timestamp(e.StartTime, true);
      const room = e.RoomId ? `room \`${e.RoomId}\`` : 'no room';
      const attendees = Number.isFinite(e.AttendeeCount) ? `${num(e.AttendeeCount)} attending` : null;
      return `• **${name}** — ${when} • ${room}${attendees ? ` • ${attendees}` : ''}`;
    });
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle('Rec Room Events')
      .setDescription(truncate(lines.join('\n'), 4096))
      .setFooter(footer(`RecFlare • ${config.domain}`));
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({ embeds: [errorEmbed(describeError(error))] });
  }
}
