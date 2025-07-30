const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Obtener la definición de una palabra.')
    .addStringOption((option) =>
      option
        .setName('word')
        .setDescription('La palabra a definir')
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString('word');

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (!response.ok) {
        return await interaction.reply(
          'No se pudo encontrar la definición. Por favor revisa la palabra e intenta de nuevo.'
        );
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return await interaction.reply('No se encontró definición para esa palabra.');
      }

      const definitions = data[0].meanings[0].definitions;

      const definitionEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Definición de "${word}"`)
        .setDescription(
          definitions
            .map((def, index) => `**${index + 1}.** ${def.definition}`)
            .join('\n')
        )
        .setFooter({ text: 'Powered by Dictionary API' })
        .setTimestamp();

      await interaction.reply({ embeds: [definitionEmbed] });
    } catch (error) {
      console.error('Error fetching definition:', error);
      await interaction.reply(
        'An error occurred while fetching the definition. Please try again later.'
      );
    }
  },
};
