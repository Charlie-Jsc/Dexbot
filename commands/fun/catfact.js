const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catfact')
    .setDescription('¡Obtén un dato curioso aleatorio sobre gatos!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const factData = await response.json();

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('¿Sabías Que?')
        .setDescription(factData.fact)
        .setFooter({ text: '¿Quieres otro dato? ¡Usa /catfact!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching cat fact:', error);
      await interaction.reply(
        "Lo siento, no pude obtener un dato de gatos en este momento. Por favor, inténtalo más tarde."
      );
    }
  },
};
