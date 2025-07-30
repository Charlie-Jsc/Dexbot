const { EmbedBuilder, MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function rerollGiveaway(interaction) {
  try {
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.findOne({ messageId, ongoing: false });

    if (!giveaway) {
      return interaction.reply({
        content: 'Sorteo no encontrado o aún está en curso.',
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
        content: '¡Necesitas el permiso `ManageMessages` para sortear de nuevo!',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (giveaway.participants.length < giveaway.winners) {
      return interaction.reply({
        content: 'No hay suficientes participantes para sortear de nuevo.',
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

    // Select new winners without duplicates
    const winners = [];
    const participants = [...giveaway.participants]; // Create a copy to avoid modifying the original array

    while (winners.length < giveaway.winners && participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      winners.push(participants.splice(randomIndex, 1)[0]);
    }

    // Update the original message
    let embed = message.embeds[0];
    if (embed) {
      embed = EmbedBuilder.from(embed);
      embed.setDescription(
        `Premio: **${giveaway.prize}**\nNuevos Ganadores: ${winners.map((w) => `<@${w}>`).join(', ')}\nOrganizado por: ${interaction.user}\nParticipantes: ${giveaway.participants.length}`
      );
      await message.edit({ embeds: [embed] }).catch(() => null);
    }

    await interaction.reply({
                content: `🎉 ¡Felicidades ${winners.map(w => `<@${w}>`).join(' ')}, ganaste **${giveaway.prize}**! 🎉`,
      flags: MessageFlags.Ephemeral,
    });

    // Announce new winners in the channel
    await channel
      .send(
        `🎉 New winners for **${giveaway.prize}**: ${winners.map((w) => `<@${w}>`).join(', ')}! Congratulations!`
      )
      .catch(() => null);
  } catch (error) {
    console.error('Error rerolling giveaway:', error);
    await interaction.reply({
      content:
        'An error occurred while rerolling the giveaway. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = rerollGiveaway;
