const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => option.setName('user').setDescription('Member to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setMaxLength(500)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) return interaction.reply({ content: '❌ I cannot ban that member. Check my role position and permissions.', flags: MessageFlags.Ephemeral });

    await interaction.guild.members.ban(user.id, { reason });
    await sendLog(interaction.guild, '🔨 Member Banned', `${interaction.user.tag} banned ${user.tag}.\nReason: ${reason}`);
    await interaction.reply({ content: `✅ Banned **${user.tag}**.`, flags: MessageFlags.Ephemeral });
  }
};
