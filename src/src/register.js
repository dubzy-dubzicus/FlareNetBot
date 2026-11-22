/**
 * Register slash commands with Discord.
 * Run: npm run deploy
 * Set DISCORD_GUILD_ID for instant guild registration during development.
 */

import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { definitions } from './commands/index.js';

// Support both guild-installed and user-installed app contexts.
// integration_types: 0 = GUILD_INSTALL, 1 = USER_INSTALL
// contexts: 0 = GUILD, 1 = BOT_DM, 2 = PRIVATE_CHANNEL
const installableDefinitions = definitions.map((cmd) => ({
  ...cmd,
  integration_types: cmd.integration_types ?? [0, 1],
  contexts: cmd.contexts ?? [0, 1, 2],
}));

if (!config.token) {
  console.error('DISCORD_TOKEN is not set.');
  process.exit(1);
}
if (!config.applicationId) {
  console.error('DISCORD_APPLICATION_ID is not set.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  console.log(`Registering ${installableDefinitions.length} command(s)...`);
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.applicationId, config.guildId)
    : Routes.applicationCommands(config.applicationId);
  const data = await rest.put(route, { body: installableDefinitions });
  console.log(`Registered ${Array.isArray(data) ? data.length : installableDefinitions.length} command(s) ${config.guildId ? `to guild ${config.guildId}` : 'globally'}.`);
  console.log('Commands include USER_INSTALL contexts so they can be used when the app is added to a user account.');
} catch (error) {
  console.error('Failed to register commands:', error);
  process.exit(1);
}
