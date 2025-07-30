const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Lanza una moneda y muestra el resultado.'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🪙 Lanzamiento de Moneda')
      .setDescription(`¡Lanzaste una moneda!`)
      .addFields(
        { name: 'Resultado', value: result, inline: true },
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
