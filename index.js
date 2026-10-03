try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  ActivityType,
  MessageFlags
} = require('discord.js');
const config = require('./config.json');
const { brandEmbed, sendLog } = require('./src/utils');
const { createTicket, closeTicket } = require('./src/tickets');

if (!process.env.BOT_TOKEN) throw new Error('Missing BOT_TOKEN. Copy .env.example to .env and paste your bot token.');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ ${config.brandName || 'Plug District'} logged in as ${client.user.tag}`);
  client.user.setActivity(config.status || 'Plug District | /help', { type: ActivityType.Watching });
});

client.on('guildMemberAdd', async member => {
  if (!config.welcomeChannelId) return;
  const channel = member.guild.channels.cache.get(config.welcomeChannelId)
    || await member.guild.channels.fetch(config.welcomeChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = brandEmbed()
    .setTitle('👋 Welcome to Plug District')
    .setDescription(`Welcome ${member} to **${member.guild.name}**!\nYou are member **#${member.guild.memberCount}**.`)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }));
  await channel.send({ embeds: [embed] }).catch(() => {});
});

client.on('guildMemberRemove', async member => {
  await sendLog(member.guild, '👋 Member Left', `${member.user.tag} (${member.id}) left the server.`);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') return createTicket(interaction);
      if (interaction.customId === 'close_ticket') return closeTicket(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const payload = { content: '❌ Something went wrong while running that command.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
});

client.login(process.env.BOT_TOKEN);
