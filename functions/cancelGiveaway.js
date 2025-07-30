const { EmbedBuilder, MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function cancelGiveaway(interaction) {
  try {
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.findOne({ messageId, ongoing: true });

    if (!giveaway) {
      return interaction.reply({
        content: 'Sorteo no encontrado o ya ha terminado.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if user has permission to manage messages
    const channel = await interaction.guild.channels
      .fetch(giveaway.channelId)
      .catch(() => null);
    if (!channel) {
      return interaction.reply({
        content: 'No se pudo encontrar el canal del sorteo.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!channel.permissionsFor(interaction.member).has(['ManageMessages'])) {
      return interaction.reply({
        content: '¡Necesitas el permiso `ManageMessages` para cancelar un sorteo!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check channel permissions
    if (
      !channel
        .permissionsFor(interaction.guild.members.me)
        .has(['SendMessages', 'EmbedLinks'])
    ) {
      return interaction.reply({
        content:
          '¡Necesito los permisos `SendMessages` y `EmbedLinks` en el canal del sorteo!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Get the message
    const message = await channel.messages
      .fetch(giveaway.messageId)
      .catch(() => null);
    if (!message) {
      return interaction.reply({
        content: 'No se pudo encontrar el mensaje del sorteo.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Update the giveaway status
    giveaway.ongoing = false;
    await giveaway.save();

    // Update the message
    let embed = message.embeds[0];
    if (embed) {
      embed = EmbedBuilder.from(embed);
      embed.setTitle('❌ Sorteo Cancelado ❌');
      embed.setDescription(
        `Premio: **${giveaway.prize}**\nEstado: **Cancelado**\nOrganizado por: ${interaction.user}\nParticipantes: ${giveaway.participants.length}`
      );
      embed.setColor('#FF0000');
      await message.edit({ embeds: [embed], components: [] }).catch(() => null);
    }

    await interaction.reply({
      content: '¡El sorteo ha sido cancelado exitosamente!',
      flags: MessageFlags.Ephemeral,
    });

    // Announce cancellation in the channel
    await channel
      .send(
        `❌ El sorteo de **${giveaway.prize}** ha sido cancelado por ${interaction.user}.`
      )
      .catch(() => null);
  } catch (error) {
    console.error('Error cancelling giveaway:', error);
    await interaction.reply({
      content:
        'Ocurrió un error al cancelar el sorteo. Por favor intenta de nuevo más tarde.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = cancelGiveaway;
