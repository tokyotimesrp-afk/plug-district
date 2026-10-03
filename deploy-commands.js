try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const config = require('./config.json');

if (!process.env.BOT_TOKEN) throw new Error('Missing BOT_TOKEN in .env');
if (!config.clientId || config.clientId.startsWith('PASTE_')) throw new Error('Set clientId in config.json');
if (!config.guildId || config.guildId.startsWith('PASTE_')) throw new Error('Set guildId in config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  console.log(`Deploying ${commands.length} Plug District slash commands...`);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
  console.log('✅ Slash commands deployed.');
})().catch(err => {
  console.error('❌ Command deployment failed:', err);
  process.exitCode = 1;
});
