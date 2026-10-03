const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { brandEmbed, sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post a Plug District announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option => option.setName('title').setDescription('Announcement title').setRequired(true).setMaxLength(200))
    .addStringOption(option => option.setName('message').setDescription('Announcement message').setRequired(true).setMaxLength(3500))
    .addChannelOption(option => option.setName('channel').setDescription('Channel to post in'))
    .addBooleanOption(option => option.setName('everyone').setDescription('Mention @everyone')),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const ping = interaction.options.getBoolean('everyone') || false;

    if (!channel?.isTextBased()) {
      return interaction.reply({ content: '❌ Pick a text channel.', flags: MessageFlags.Ephemeral });
    }

    const embed = brandEmbed().setTitle(`📢 ${title}`).setDescription(message);
    await channel.send({
      content: ping ? '@everyone' : undefined,
      embeds: [embed],
      allowedMentions: { parse: ping ? ['everyone'] : [] }
    });
    await sendLog(interaction.guild, '📢 Announcement Posted', `${interaction.user.tag} posted an announcement in ${channel}.`);
    await interaction.reply({ content: '✅ Announcement posted.', flags: MessageFlags.Ephemeral });
  }
};
