const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dadjoke')
    .setDescription('¡Obtén un chiste de papá aleatorio!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'application/json',
        },
      });
      const jokeData = await response.json();

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("¡Aquí tienes un Chiste de Papá!")
        .setDescription(jokeData.joke)
        .setFooter({ text: '¿Quieres escuchar otro? ¡Usa /dadjoke!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching dad joke:', error);
      await interaction.reply(
        "Lo siento, no pude obtener un chiste de papá en este momento. Por favor, inténtalo más tarde."
      );
    }
  },
};
