const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloquea el canal para evitar que se envíen mensajes.'),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content:
          'No tienes el permiso `ManageChannels` para bloquear este canal.',
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    if (
      channel
        .permissionsFor(channel.guild.roles.everyone)
        .has(PermissionsBitField.Flags.SendMessages)
    ) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Canal Bloqueado')
        .setDescription(
          `El canal ${channel.name} ha sido bloqueado. Solo usuarios con el rol apropiado pueden enviar mensajes.`
        )
        .setTimestamp();

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: false,
      });

      try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Error sending lock confirmation:', error);
      }
    } else {
      await interaction.reply({
        content: 'Este canal ya está bloqueado.',
        ephemeral: true,
      });
    }
  },
};
