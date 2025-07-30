const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('headavatar')
    .setDescription('Generar un avatar de cabeza de jugador de Minecraft')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Minecraft para obtener la cabeza del jugador')
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName('direction')
        .setDescription('dirección del avatar')
        .setRequired(false)
        .addChoices(
          { name: 'Izquierda', value: 'left' },
          { name: 'Derecha', value: 'right' }
        )
    ),

  async execute(interaction) {
    const direction = interaction.options.getString('direction') || null;
    const username = interaction.options.getString('username');
    const headUrl = `https://mc-heads.net/head/${username}/${direction}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Avatar de Cabeza del Jugador')
        .setStyle(ButtonStyle.Link)
        .setURL(headUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Avatar de Cabeza de Jugador de Minecraft`,
          image: { url: headUrl },
          color: 0xff5555,
          description: `Avatar de cabeza de Minecraft para: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
