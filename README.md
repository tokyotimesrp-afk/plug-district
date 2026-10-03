# Plug District Discord Bot

A Discord shop/community bot built with discord.js v14.

## Included

- `/help`
- `/ticket`, `/close`, `/ticketpanel`
- `/prices`
- `/stock` with Set/Add/Remove/Delete/List
- `/vouch`
- `/announce`
- `/shoprole` for Customer/Reseller roles
- `/purge`, `/timeout`, `/kick`, `/ban`
- Welcome message
- Ticket, moderation, role, stock, and leave logs
- JSON product/stock storage

## 1. Install Node.js

Use Node.js 22 or newer.

## 2. Install packages

Open PowerShell in this folder and run:

```powershell
npm install
```

## 3. Create your `.env`

Copy `.env.example` and rename the copy to `.env`.

Put your bot token inside:

```env
BOT_TOKEN=YOUR_REAL_BOT_TOKEN
```

Never post your bot token in Discord or screenshots.

## 4. Fill out `config.json`

Required:

- `clientId` = Discord application ID
- `guildId` = your Plug District Discord server ID

Optional but recommended:

- `ticketCategoryId`
- `supportRoleId`
- `logChannelId`
- `welcomeChannelId`
- `vouchChannelId`
- `customerRoleId`
- `resellerRoleId`

To copy IDs in Discord, enable Developer Mode in Discord settings, then right-click the server/channel/role and choose Copy ID.

## 5. Bot permissions

When inviting the bot, give it the `bot` and `applications.commands` scopes.

Recommended server permissions:

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels
- Manage Messages
- Manage Roles
- Moderate Members
- Kick Members
- Ban Members

Make sure the bot role is ABOVE the Customer/Reseller/member roles it needs to manage.

For welcome messages, enable the **Server Members Intent** in the Discord Developer Portal under Bot > Privileged Gateway Intents.

## 6. Deploy slash commands

```powershell
npm run deploy
```

You should see:

```text
✅ Slash commands deployed.
```

## 7. Start the bot

```powershell
npm start
```

You should see something like:

```text
✅ Plug District logged in as YourBot#0000
```

## First setup inside Discord

1. Run `/ticketpanel` in your support channel.
2. Add products with `/stock action:Set`.
3. Run `/prices` to test your shop list.
4. Set your vouch/log/welcome IDs in `config.json`.
5. Restart the bot after changing config IDs.

## Example stock setup

Use:

`/stock action:Set product:nuvia-week quantity:10 name:Nuvia - Week price:$15.00`

Then `/prices` will display it automatically.

## Security

Keep `.env` private. If your bot token is ever exposed, reset it immediately in the Discord Developer Portal and replace it in `.env`.
