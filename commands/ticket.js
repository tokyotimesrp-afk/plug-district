const { SlashCommandBuilder } = require('discord.js');
const { createTicket } = require('../src/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a private support ticket'),
  async execute(interaction) {
    await createTicket(interaction);
  }
};
