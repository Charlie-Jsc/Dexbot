const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fullbody')
    .setDescription('Generar un cuerpo completo de jugador de Minecraft')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Minecraft para obtener el cuerpo del jugador')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const bodyUrl = `https://mc-heads.net/player/${username}/256`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Cuerpo del Jugador')
        .setStyle(ButtonStyle.Link)
        .setURL(bodyUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Cuerpo Completo de Jugador de Minecraft`,
          image: { url: bodyUrl },
          color: 0xff5555,
          description: `Cuerpo completo de Minecraft para: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
