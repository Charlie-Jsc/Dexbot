const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bodyavatar')
    .setDescription('Generar un avatar de cuerpo de jugador de Minecraft')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Minecraft para obtener el cuerpo del jugador')
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
    const bodyUrl = `https://mc-heads.net/body/${username}/${direction}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Avatar de Cuerpo del Jugador')
        .setStyle(ButtonStyle.Link)
        .setURL(bodyUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Avatar de Cuerpo de Jugador de Minecraft`,
          image: { url: bodyUrl },
          color: 0xff5555,
          description: `Avatar de cuerpo de Minecraft para: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
