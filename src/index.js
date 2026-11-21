/**
 * Bot entry point.
 */

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { byName } from './commands/index.js';

if (!config.token) {
  console.error('DISCORD_TOKEN is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, (ready) => {
  console.log(`Logged in as ${ready.user.tag}`);
  console.log(`Reading RecFlare data from ${config.domain}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = byName.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`/${interaction.commandName} failed:`, error);
    const message = 'Something went wrong running that command.';
    try {
      if (interaction.deferred || interaction.replied) await interaction.editReply({ content: message });
      else await interaction.reply({ content: message, ephemeral: true });
    } catch {
      // interaction expired
    }
  }
});

client.login(config.token);
