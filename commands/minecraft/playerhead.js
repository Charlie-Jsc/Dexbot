const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playerhead')
    .setDescription('Generar una cabeza de jugador de Minecraft')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Minecraft para obtener la cabeza del jugador')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const headUrl = `https://mc-heads.net/avatar/${username}/256`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Cabeza del Jugador')
        .setStyle(ButtonStyle.Link)
        .setURL(headUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Cabeza de Jugador de Minecraft`,
          image: { url: headUrl },
          color: 0xff5555,
          description: `Cabeza de Minecraft para: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
