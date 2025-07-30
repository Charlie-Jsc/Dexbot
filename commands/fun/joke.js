const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Cuenta un chiste aleatorio'),

  async execute(interaction) {
    const response = await fetch(
      'https://official-joke-api.appspot.com/random_joke'
    );
    const joke = await response.json();

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎭 Chiste')
      .addFields(
        { name: 'Preparación', value: joke.setup, inline: false },
        { name: 'Remate', value: joke.punchline, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
