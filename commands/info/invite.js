const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Obtén el enlace de invitación para el bot.'),

  async execute(interaction) {
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('🔹 Enlace de Invitación')
      .setDescription(
        '¡Haz clic en el botón de abajo para invitar el bot a tu servidor!'
      )
      .setColor('#3498db')
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel('Invitar Bot')
      .setStyle(ButtonStyle.Link)
      .setURL(inviteLink);

    const row = new ActionRowBuilder().addComponents(button);

    // Send the message publicly
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
