const { EmbedBuilder, MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function endGiveaway(interaction) {
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
        content: '¡Necesitas el permiso `ManageMessages` para terminar un sorteo!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Filter out the host from participants
    const eligibleParticipants = giveaway.participants.filter(
      (participant) => participant !== giveaway.hostId
    );

    if (eligibleParticipants.length < giveaway.winners) {
      return interaction.reply({
        content: 'No hay suficientes participantes para el sorteo.',
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

    // Select winners without duplicates and excluding the host
    const winners = [];
    const participants = [...eligibleParticipants]; // Create a copy to avoid modifying the original array

    while (winners.length < giveaway.winners && participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      winners.push(participants.splice(randomIndex, 1)[0]);
    }

    giveaway.ongoing = false;
    await giveaway.save();

    let embed = message.embeds[0];
    if (!embed) {
      embed = new EmbedBuilder().setTitle('Sorteo Terminado').setColor('#00FF00');
    } else {
      embed = EmbedBuilder.from(embed);
    }

    embed.setTitle('🎉 Sorteo Terminado 🎉');
    embed.setDescription(
      `Premio: **${giveaway.prize}**\nGanadores: ${winners.map((w) => `<@${w}>`).join(', ')}\nOrganizado por: <@${giveaway.hostId}>\nParticipantes: ${eligibleParticipants.length}`
    );
    embed.setColor('#00FF00');

    await message.edit({ embeds: [embed], components: [] }).catch(() => null);
    await channel
      .send(
        `🎉 ¡Felicidades ${winners.map((w) => `<@${w}>`).join(', ')}! ¡Ganaste **${giveaway.prize}**! 🎉`
      )
      .catch(() => null);
    await interaction.reply({
      content: '¡Sorteo terminado exitosamente y los ganadores han sido anunciados!',
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('Error ending giveaway:', error);
    await interaction.reply({
      content:
        'Ocurrió un error al terminar el sorteo. Por favor intenta de nuevo más tarde.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = endGiveaway;
