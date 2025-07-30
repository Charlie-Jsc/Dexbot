const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/Giveaway');
const ms = require('ms');

async function startGiveaway(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const duration = interaction.options.getString('duration');
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners');
    const requiredRole = interaction.options.getRole('required_role');
    const channel = interaction.options.getChannel('channel');
    const channelId = channel ? channel.id : interaction.channel.id;
    const endTime = Date.now() + ms(duration);
    const durationRegex = /^(?:\d+d)?(?:\d+h)?(?:\d+m)?(?:\d+s)?$/;

    // Validate duration format
    if (!durationRegex.test(duration)) {
      return interaction.editReply({
        content: '¡Formato de duración inválido! Usa algo como `1d2h30m40s`.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate minimum duration (30 seconds)
    if (ms(duration) < 30000) {
      return interaction.editReply({
        content: '¡La duración del sorteo debe ser de al menos 30 segundos!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate maximum duration (30 days)
    if (ms(duration) > 2592000000) {
      return interaction.editReply({
        content: '¡La duración del sorteo no puede ser mayor a 30 días!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate winners count
    if (winners < 1) {
      return interaction.editReply({
        content: '¡El número de ganadores debe ser al menos 1!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate maximum winners
    if (winners > 50) {
      return interaction.editReply({
        content: '¡El número de ganadores no puede ser mayor a 50!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Check channel permissions
    const targetChannel = channel || interaction.channel;
    if (
      !targetChannel
        .permissionsFor(interaction.guild.members.me)
        .has(['SendMessages', 'EmbedLinks', 'AddReactions'])
    ) {
      return interaction.editReply({
        content:
          '¡Necesito los permisos `SendMessages`, `EmbedLinks` y `AddReactions` en el canal objetivo!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Check if user has permission to manage messages
    if (
      !targetChannel.permissionsFor(interaction.member).has(['ManageMessages'])
    ) {
      return interaction.editReply({
        content: '¡Necesitas el permiso `ManageMessages` para iniciar un sorteo!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 ¡Nuevo Sorteo! 🎉')
      .setDescription(
        `Premio: **${prize}**\nOrganizado por: ${interaction.user}\nTermina en: <t:${Math.floor(endTime / 1000)}:R>\nGanadores: **${winners}**`
      )
      .setColor('#FF0000')
      .setTimestamp(endTime);

    if (requiredRole) {
      embed.addFields({
        name: 'Rol Requerido',
        value: `${requiredRole}`,
        inline: true,
      });
    }

    const joinButton = new ButtonBuilder()
      .setCustomId('join_giveaway')
      .setLabel('🎉 Unirse')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(joinButton);

    const message = await targetChannel.send({
      embeds: [embed],
      components: [row],
    });

    const giveaway = new Giveaway({
      guildId: interaction.guild.id,
      channelId: channelId,
      messageId: message.id,
      prize: prize,
      endTime: new Date(endTime),
      winners: winners,
      participants: [],
      ongoing: true,
      requiredRole: requiredRole ? requiredRole.id : null,
      hostId: interaction.user.id,
    });

    await giveaway.save();

    await interaction.editReply({
      content: `¡Sorteo iniciado en ${targetChannel}!`,
      flags: [MessageFlags.Ephemeral],
    });
  } catch (error) {
    console.error('Error starting giveaway:', error);
    // Use editReply in the catch block as well
    await interaction.editReply({
      content:
        'Ocurrió un error al iniciar el sorteo. Por favor intenta de nuevo más tarde.',
      flags: [MessageFlags.Ephemeral],
    });
  }
}

module.exports = startGiveaway;
