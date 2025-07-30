const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Borra un número específico de mensajes del canal.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Número de mensajes a eliminar')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({
        content: 'No tienes permiso para borrar mensajes.',
        ephemeral: true,
      });
    }
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: 'Por favor proporciona un número entre 1 y 100.',
        ephemeral: true,
      });
    }

    await interaction.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Mensajes Borrados')
      .setDescription(`${amount} mensajes han sido eliminados.`)
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
