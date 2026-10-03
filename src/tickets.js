const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const config = require('../config.json');
const { brandEmbed, sendLog, safeChannelName } = require('./utils');

async function createTicket(interaction) {
  if (!interaction.guild) {
    return interaction.reply({ content: 'Tickets can only be created inside the server.', flags: MessageFlags.Ephemeral });
  }

  const existing = interaction.guild.channels.cache.find(
    ch => ch.type === ChannelType.GuildText && ch.topic === `ticketOwner:${interaction.user.id}`
  );
  if (existing) {
    return interaction.reply({ content: `You already have an open ticket: ${existing}`, flags: MessageFlags.Ephemeral });
  }

  const overwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks
      ]
    }
  ];

  if (config.supportRoleId) {
    overwrites.push({
      id: config.supportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  if (interaction.client.user?.id) {
    overwrites.push({
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${safeChannelName(interaction.user.username)}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId || undefined,
    topic: `ticketOwner:${interaction.user.id}`,
    permissionOverwrites: overwrites
  });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = brandEmbed()
    .setTitle('🎫 Plug District Support')
    .setDescription(
      `Welcome ${interaction.user}. Tell us what you need help with and a staff member will respond.\n\n` +
      `Please include any useful order/product details without posting passwords, tokens, or other private credentials.`
    );

  await channel.send({
    content: config.supportRoleId ? `<@&${config.supportRoleId}> ${interaction.user}` : `${interaction.user}`,
    embeds: [embed],
    components: [closeRow],
    allowedMentions: { roles: config.supportRoleId ? [config.supportRoleId] : [], users: [interaction.user.id] }
  });

  await interaction.reply({ content: `Your ticket was created: ${channel}`, flags: MessageFlags.Ephemeral });
  await sendLog(interaction.guild, '🎫 Ticket Created', `${interaction.user.tag} created ${channel}.`);
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText || !channel.topic?.startsWith('ticketOwner:')) {
    return interaction.reply({ content: 'This is not a Plug District ticket channel.', flags: MessageFlags.Ephemeral });
  }

  const ownerId = channel.topic.split(':')[1];
  const member = interaction.member;
  const isOwner = interaction.user.id === ownerId;
  const isSupport = Boolean(config.supportRoleId && member?.roles?.cache?.has(config.supportRoleId));
  const canManage = Boolean(member?.permissions?.has(PermissionFlagsBits.ManageChannels));

  if (!isOwner && !isSupport && !canManage) {
    return interaction.reply({ content: 'You do not have permission to close this ticket.', flags: MessageFlags.Ephemeral });
  }

  await interaction.reply('🔒 Closing this ticket...');
  await sendLog(interaction.guild, '🔒 Ticket Closed', `${interaction.user.tag} closed #${channel.name}.`);
  setTimeout(() => channel.delete('Plug District ticket closed').catch(() => {}), 2000);
}

module.exports = { createTicket, closeTicket };
