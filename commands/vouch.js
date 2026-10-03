const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config.json');
const { readStore, writeStore } = require('../src/storage');
const { brandEmbed } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Leave a Plug District vouch/review')
    .addIntegerOption(option => option
      .setName('rating')
      .setDescription('Rating from 1 to 5')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(5))
    .addStringOption(option => option
      .setName('comment')
      .setDescription('Your review')
      .setRequired(true)
      .setMaxLength(800)),

  async execute(interaction) {
    const rating = interaction.options.getInteger('rating');
    const comment = interaction.options.getString('comment');
    const store = readStore();
    store.vouchCount += 1;
    writeStore(store);

    const embed = brandEmbed()
      .setTitle(`⭐ Vouch #${store.vouchCount}`)
      .setDescription(comment)
      .addFields(
        { name: 'Customer', value: `${interaction.user}`, inline: true },
        { name: 'Rating', value: `${'⭐'.repeat(rating)} (${rating}/5)`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }));

    const target = config.vouchChannelId
      ? interaction.guild.channels.cache.get(config.vouchChannelId) || await interaction.guild.channels.fetch(config.vouchChannelId).catch(() => null)
      : interaction.channel;

    if (!target?.isTextBased()) {
      return interaction.reply({ content: '❌ The configured vouch channel is invalid.', flags: MessageFlags.Ephemeral });
    }

    await target.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Thanks for vouching! Vouch #${store.vouchCount} was posted.`, flags: MessageFlags.Ephemeral });
  }
};
