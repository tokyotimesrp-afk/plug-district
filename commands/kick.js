const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option => option.setName('user').setDescription('Member to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setMaxLength(500)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member?.kickable) return interaction.reply({ content: '❌ I cannot kick that member. Check my role position and permissions.', flags: MessageFlags.Ephemeral });

    await member.kick(reason);
    await sendLog(interaction.guild, '👢 Member Kicked', `${interaction.user.tag} kicked ${user.tag}.\nReason: ${reason}`);
    await interaction.reply({ content: `✅ Kicked **${user.tag}**.`, flags: MessageFlags.Ephemeral });
  }
};
