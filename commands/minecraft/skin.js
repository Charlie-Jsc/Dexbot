const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skin')
    .setDescription("Obtener la skin de un jugador de Minecraft")
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Minecraft para obtener la skin')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const skinUrl = `https://mc-heads.net/skin/${username}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Skin')
        .setStyle(ButtonStyle.Link)
        .setURL(skinUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `🤖 Skin de Minecraft para ${username}`,
          image: { url: skinUrl },
          color: 0x55ff55,
          description: `Aquí está la skin para el jugador de Minecraft: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
