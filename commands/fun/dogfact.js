const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dogfact')
    .setDescription('¡Obtén un dato curioso aleatorio sobre perros!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://dog-api.kinduff.com/api/facts');
      const factData = await response.json();
      // json
      // {"facts":[],"success":false}
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('¿Sabías Que?')
        .setDescription(factData.facts[0])
        .setFooter({ text: '¿Quieres otro dato? ¡Usa /dogfact!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching dog fact:', error);
      await interaction.reply(
        "Lo siento, no pude obtener un dato de perros en este momento. Por favor, inténtalo más tarde."
      );
    }
  },
};
