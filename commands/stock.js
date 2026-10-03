const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { readStore, writeStore } = require('../src/storage');
const { brandEmbed, sendLog } = require('../src/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock')
    .setDescription('Manage Plug District product stock')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option => option
      .setName('action')
      .setDescription('What to do')
      .setRequired(true)
      .addChoices(
        { name: 'List', value: 'list' },
        { name: 'Set', value: 'set' },
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' },
        { name: 'Delete Product', value: 'delete' }
      ))
    .addStringOption(option => option.setName('product').setDescription('Product key, e.g. nuvia-week'))
    .addIntegerOption(option => option.setName('quantity').setDescription('Stock quantity').setMinValue(0))
    .addStringOption(option => option.setName('name').setDescription('Display name for a new/updated product'))
    .addStringOption(option => option.setName('price').setDescription('Display price, e.g. $15.00')),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const productKeyRaw = interaction.options.getString('product');
    const quantity = interaction.options.getInteger('quantity');
    const name = interaction.options.getString('name');
    const price = interaction.options.getString('price');
    const store = readStore();

    if (action === 'list') {
      const entries = Object.entries(store.products);
      const embed = brandEmbed().setTitle('📦 Stock Manager');
      embed.setDescription(entries.length
        ? entries.map(([key, p]) => `• **${key}** — ${p.name} — ${p.price} — Stock: ${p.stock}`).join('\n').slice(0, 4000)
        : 'No products yet. Use `/stock action:Set` to create one.');
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    if (!productKeyRaw) {
      return interaction.reply({ content: '❌ You need to provide `product` for that action.', flags: MessageFlags.Ephemeral });
    }

    const key = productKeyRaw.toLowerCase().trim().replace(/\s+/g, '-');
    const existing = store.products[key];

    if (action === 'delete') {
      if (!existing) return interaction.reply({ content: '❌ That product does not exist.', flags: MessageFlags.Ephemeral });
      delete store.products[key];
      writeStore(store);
      await sendLog(interaction.guild, '🗑️ Product Deleted', `${interaction.user.tag} deleted **${key}**.`);
      return interaction.reply({ content: `✅ Deleted **${key}**.`, flags: MessageFlags.Ephemeral });
    }

    if (action === 'set') {
      if (quantity === null) {
        return interaction.reply({ content: '❌ `quantity` is required when setting stock.', flags: MessageFlags.Ephemeral });
      }
      store.products[key] = {
        name: name || existing?.name || productKeyRaw,
        price: price || existing?.price || 'Ask staff',
        stock: quantity
      };
    } else {
      if (!existing) return interaction.reply({ content: '❌ That product does not exist. Use `Set` first.', flags: MessageFlags.Ephemeral });
      if (quantity === null || quantity < 1) {
        return interaction.reply({ content: '❌ Use a quantity of at least 1 for Add/Remove.', flags: MessageFlags.Ephemeral });
      }
      if (action === 'add') existing.stock += quantity;
      if (action === 'remove') existing.stock = Math.max(0, existing.stock - quantity);
      if (name) existing.name = name;
      if (price) existing.price = price;
    }

    writeStore(store);
    const item = store.products[key];
    await sendLog(interaction.guild, '📦 Stock Updated', `${interaction.user.tag} updated **${item.name}** to stock **${item.stock}**.`);
    await interaction.reply({ content: `✅ **${item.name}** now has **${item.stock}** in stock at **${item.price}**.`, flags: MessageFlags.Ephemeral });
  }
};
