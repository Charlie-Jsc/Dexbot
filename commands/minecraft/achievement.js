const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Generar un logro estilo Minecraft')
    .addStringOption((option) =>
      option
        .setName('icon')
        .setDescription('Selecciona un icono de logro para tu servidor de Minecraft.')
        .setRequired(true)
        .addChoices(
          { name: 'Césped', value: '1' },
          { name: 'Diamante', value: '2' },
          { name: 'Espada de Diamante', value: '3' },
          { name: 'Creeper', value: '4' },
          { name: 'Cerdo', value: '5' },
          { name: 'TNT', value: '6' },
          { name: 'Galleta', value: '7' },
          { name: 'Corazón', value: '8' },
          { name: 'Cama', value: '9' },
          { name: 'Pastel', value: '10' },
          { name: 'Letrero', value: '11' },
          { name: 'Riel', value: '12' },
          { name: 'Mesa de Trabajo', value: '13' },
          { name: 'Redstone', value: '14' },
          { name: 'Fuego', value: '15' },
          { name: 'Telaraña', value: '16' },
          { name: 'Cofre', value: '17' },
          { name: 'Horno', value: '18' },
          { name: 'Libro', value: '19' },
          { name: 'Piedra', value: '20' },
          { name: 'Tablón de Madera', value: '21' },
          { name: 'Hierro', value: '22' },
          { name: 'Oro', value: '23' },
          { name: 'Puerta de Madera', value: '24' },
          { name: 'Puerta de Hierro', value: '25' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('head')
        .setDescription('Encabezado para el logro')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Cuerpo para el logro')
        .setRequired(true)
    ),

  async execute(interaction) {
    const achievementHead = interaction.options.getString('head');
    const achievementText = interaction.options.getString('text');
    const icon = interaction.options.getString('icon');
    const achievementUrl = `https://minecraftskinstealer.com/achievement/${encodeURIComponent(icon)}/${encodeURIComponent(achievementHead)}/${encodeURIComponent(achievementText)}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Descargar Logro')
        .setStyle(ButtonStyle.Link)
        .setURL(achievementUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `🏆 Logro de Minecraft`,
          image: { url: achievementUrl },
          color: 0xffaa00,
          description: `¡Logro personalizado desbloqueado!`,
        },
      ],
      components: [downloadButton],
    });
  },
};
