const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Obtén el enlace del servidor de soporte.'),

  async execute(interaction) {
    const supportServerLink = 'https://discord.gg/kAYpdenZ8b'; // Replace with your actual support server link

    const embed = new EmbedBuilder()
      .setTitle('🔹 Servidor de Soporte')
      .setDescription(
        '¿Necesitas ayuda? ¡Únete a nuestro servidor de soporte usando el botón de abajo!'
      )
      .setColor('#ffcc00')
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel('Unirse al Servidor de Soporte')
      .setStyle(ButtonStyle.Link)
      .setURL(supportServerLink);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] }); // No ephemeral flag, so it's public
  },
};
