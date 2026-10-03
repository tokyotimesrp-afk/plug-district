const { SlashCommandBuilder } = require('discord.js');
const { brandEmbed } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View Plug District bot commands'),
  async execute(interaction) {
    const embed = brandEmbed()
      .setTitle('🔌 Plug District Bot')
      .setDescription('Shop, support, vouches, roles, announcements, and moderation in one bot.')
      .addFields(
        { name: '🛒 Shop', value: '`/prices` • `/stock`', inline: false },
        { name: '🎫 Support', value: '`/ticket` • `/ticketpanel` • `/close`', inline: false },
        { name: '⭐ Community', value: '`/vouch`', inline: false },
        { name: '🛡️ Staff', value: '`/announce` • `/shoprole` • `/purge` • `/timeout` • `/kick` • `/ban`', inline: false }
      );
    await interaction.reply({ embeds: [embed] });
  }
};
