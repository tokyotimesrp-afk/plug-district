const { SlashCommandBuilder } = require('discord.js');
const { readStore } = require('../src/storage');
const { brandEmbed } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prices')
    .setDescription('View Plug District products, prices, and stock'),
  async execute(interaction) {
    const store = readStore();
    const products = Object.entries(store.products);

    const embed = brandEmbed().setTitle('🛒 Plug District Shop');
    if (!products.length) {
      embed.setDescription('No products have been added yet.');
    } else {
      embed.setDescription('Current product list and availability.');
      embed.addFields(products.slice(0, 25).map(([key, item]) => ({
        name: item.name || key,
        value: `**Price:** ${item.price || 'Ask staff'}\n**Stock:** ${Number(item.stock || 0)}`,
        inline: true
      })));
    }

    await interaction.reply({ embeds: [embed] });
  }
};
