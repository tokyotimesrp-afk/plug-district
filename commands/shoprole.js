const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const config = require('../config.json');
const { sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shoprole')
    .setDescription('Give a Plug District customer or reseller role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option => option.setName('user').setDescription('User to update').setRequired(true))
    .addStringOption(option => option
      .setName('role')
      .setDescription('Shop role')
      .setRequired(true)
      .addChoices(
        { name: 'Customer', value: 'customer' },
        { name: 'Reseller', value: 'reseller' }
      ))
    .addStringOption(option => option
      .setName('action')
      .setDescription('Add or remove the role')
      .setRequired(true)
      .addChoices(
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' }
      )),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('role');
    const action = interaction.options.getString('action');
    const roleId = type === 'customer' ? config.customerRoleId : config.resellerRoleId;

    if (!roleId) {
      return interaction.reply({ content: `❌ Set ${type}RoleId in config.json first.`, flags: MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const role = interaction.guild.roles.cache.get(roleId) || await interaction.guild.roles.fetch(roleId).catch(() => null);
    if (!member || !role) return interaction.reply({ content: '❌ Could not find that member or configured role.', flags: MessageFlags.Ephemeral });

    if (action === 'add') await member.roles.add(role, `Plug District role added by ${interaction.user.tag}`);
    else await member.roles.remove(role, `Plug District role removed by ${interaction.user.tag}`);

    await sendLog(interaction.guild, '🏷️ Shop Role Updated', `${interaction.user.tag} ${action === 'add' ? 'added' : 'removed'} ${role} ${action === 'add' ? 'to' : 'from'} ${user.tag}.`);
    await interaction.reply({ content: `✅ ${action === 'add' ? 'Added' : 'Removed'} ${role} ${action === 'add' ? 'to' : 'from'} ${user}.`, flags: MessageFlags.Ephemeral });
  }
};
