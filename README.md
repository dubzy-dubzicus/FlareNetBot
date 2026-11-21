# RecFlare Discord Bot

A standalone Discord bot for browsing RecFlare data: users, rooms, photos, and search results.

## Features

- `/user query:<username|id>` – show a RecFlare profile card (bio, pronouns, platforms, join date, rooms).
- `/room query:<name|id>` – show room details, stats, tags, creator, and platform support.
- `/rooms query:<search>` – search rooms by name/tag.
- `/photos user:<username|id>` – show recent photos taken by a player.
- `/photo id:<photo id>` – show details for a specific photo.
- `/search query:<name>` – search accounts by name.
- `/help` – list available commands.

## Setup

1. **Install Node.js 20.12+**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create a Discord application/bot**
   - Go to https://discord.com/developers/applications
   - Create an app, add a Bot, copy the bot token.
   - Copy the Application ID.
   - Invite the bot with `applications.commands` and `bot` scopes.
4. **Configure environment**
   ```bash
   copy .env.example .env
   ```
   Fill in:
   - `DISCORD_TOKEN`
   - `DISCORD_APPLICATION_ID`
   - optional `DISCORD_GUILD_ID` for fast guild-only command registration during development

5. **Register slash commands**
   ```bash
   npm run deploy
   ```
   Use `DISCORD_GUILD_ID` for instant guild updates; omit it for global registration (can take time to propagate).

6. **Start the bot**
   ```bash
   npm start
   ```

## Environment variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `DISCORD_TOKEN` | yes | - | Discord bot token |
| `DISCORD_APPLICATION_ID` | yes for deploy | - | Discord application/client ID |
| `DISCORD_GUILD_ID` | no | - | Register commands to one guild |
| `RECFLARE_DOMAIN` | no | `recflare.net` | RecFlare domain |
| `RECFLARE_COLOR` | no | `#5865F2` | Embed accent color |
| `RECFLARE_TIMEOUT_MS` | no | `10000` | API request timeout |
| `RECFLARE_CACHE_TTL_MS` | no | `60000` | In-memory cache TTL |

## Notes

- Uses public RecFlare endpoints (no Rec Room/RecFlare auth token).
- Command registration is separate from runtime (`npm run deploy`).
- The bot is intentionally read-only.
