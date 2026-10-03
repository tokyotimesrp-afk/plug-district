const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

function brandEmbed() {
  return new EmbedBuilder()
    .setColor(config.accentColor || '#5865F2')
    .setFooter({ text: config.brandName || 'Plug District' })
    .setTimestamp();
}

async function sendLog(guild, title, description, fields = []) {
  if (!config.logChannelId) return;
  const channel = guild.channels.cache.get(config.logChannelId)
    || await guild.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = brandEmbed().setTitle(title).setDescription(description || null);
  if (fields.length) embed.addFields(fields);
  await channel.send({ embeds: [embed] }).catch(() => {});
}

function safeChannelName(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'customer';
}

module.exports = { brandEmbed, sendLog, safeChannelName };
