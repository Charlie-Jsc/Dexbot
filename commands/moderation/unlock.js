const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloquea el canal para permitir que se envíen mensajes.'),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content: 'No tienes permiso para bloquear este canal.',
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    if (
      !channel
        .permissionsFor(channel.guild.roles.everyone)
        .has(PermissionsBitField.Flags.SendMessages)
    ) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('Canal Desbloqueado')
        .setDescription(
          `El canal ${channel.name} ha sido desbloqueado. Todos pueden enviar mensajes`
        )
        .setTimestamp();

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: true,
      });

      try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Error sending lock confirmation:', error);
      }
    } else {
      await interaction.reply({
        content: 'Este canal ya está desbloqueado.',
        ephemeral: true,
      });
    }
  },
};
