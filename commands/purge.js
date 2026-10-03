const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete recent messages in the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Number of recent messages to delete')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (!interaction.channel?.isTextBased() || !interaction.channel.bulkDelete) {
      return interaction.reply({ content: '❌ This command cannot be used here.', flags: MessageFlags.Ephemeral });
    }
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await sendLog(interaction.guild, '🧹 Messages Purged', `${interaction.user.tag} deleted **${deleted.size}** recent messages in ${interaction.channel}.`);
    await interaction.reply({ content: `✅ Deleted **${deleted.size}** recent messages. Discord does not allow bulk deletion of messages older than 14 days.`, flags: MessageFlags.Ephemeral });
  }
};
