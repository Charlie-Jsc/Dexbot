const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomnumber')
    .setDescription('Genera un número aleatorio entre el rango especificado.')
    .addIntegerOption((option) =>
      option
        .setName('min')
        .setDescription('Número mínimo (inclusivo)')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('max')
        .setDescription('Número máximo (inclusivo)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎲 Generador de Números Aleatorios')
      .setDescription(
        `Solicitaste un número aleatorio entre **${min}** y **${max}**.`
      )
      .addFields(
        {
          name: 'Número Aleatorio',
          value: `${randomNumber}`,
          inline: true,
        },
        {
          name: 'Solicitado por',
          value: `${interaction.user.tag}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
