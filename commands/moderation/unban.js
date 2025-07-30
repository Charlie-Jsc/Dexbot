const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanear a un miembro del servidor.')
    .addStringOption((option) =>
      option
        .setName('user_id')
        .setDescription('El ID del usuario a desbanear')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Razón para desbanear al usuario')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason =
      interaction.options.getString('reason') || 'No se proporcionó razón.';
    const executor = interaction.member;

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({
        content: 'No tienes el permiso `BanMembers` para banear miembros!',
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.unban(userId, reason);

      const unbanEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Miembro Desbaneado')
        .setDescription(`✅ \`${userId}\` ha sido desbaneado del servidor.`)
        .addFields(
          { name: 'Razón', value: reason, inline: true },
          {
            name: 'Desbaneado por',
            value: `<@${interaction.user.id}>`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          'Falló al desbanear al usuario. Por favor asegúrate de que el ID del usuario es correcto y que tengo permiso para desbanear miembros.',
        ephemeral: true,
      });
    }
  },
};
