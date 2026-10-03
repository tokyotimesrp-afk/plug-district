const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => option.setName('user').setDescription('Member to timeout').setRequired(true))
    .addIntegerOption(option => option.setName('minutes').setDescription('Timeout length in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setMaxLength(500)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member?.moderatable) return interaction.reply({ content: '❌ I cannot timeout that member. Check my role position and permissions.', flags: MessageFlags.Ephemeral });
    await member.timeout(minutes * 60_000, reason);
    await sendLog(interaction.guild, '⏳ Member Timed Out', `${interaction.user.tag} timed out ${user.tag} for **${minutes} minute(s)**.\nReason: ${reason}`);
    await interaction.reply({ content: `✅ Timed out ${user} for **${minutes} minute(s)**.`, flags: MessageFlags.Ephemeral });
  }
};
