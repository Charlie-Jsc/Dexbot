const {
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const TicketSettings = require('../models/TicketSettings');
const Ticket = require('../models/Ticket');
const TicketCategory = require('../models/TicketCategory');
const TicketBan = require('../models/TicketBan');
const closeTicket = require('../functions/closeTicket');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const settings = await TicketSettings.findOne({
      guildId: interaction.guildId,
    });
    if (!settings?.enabled) return;

    if (interaction.customId === 'close_ticket') {
      try {
        await interaction.deferReply();
        await closeTicket(interaction.channel, interaction.user);
      } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.editReply(
          '❌ Ocurrió un error al cerrar el ticket.'
        );
      }
      return;
    }

    if (interaction.customId === 'claim_ticket') {
      try {
        const channel = interaction.channel;
        if (!channel.name.startsWith('ticket-')) return;

        await interaction.deferReply();

        const member = await interaction.guild.members.fetch(
          interaction.user.id
        );
        const hasPermission = settings.supportRoleIds.some((roleId) =>
          member.roles.cache.has(roleId)
        );

        if (!hasPermission) {
          return interaction.editReply({
            content: '❌ ¡No tienes permisos para reclamar tickets!',
          });
        }

        const ticket = await Ticket.findOne({
          channelId: channel.id,
          status: 'open',
        });

        if (!ticket) {
          return interaction.editReply(
            '❌ Ticket not found or already closed.'
          );
        }

        if (ticket.claimedBy) {
          const claimer = await interaction.client.users.fetch(
            ticket.claimedBy
          );
          return interaction.editReply(
            `❌ This ticket is already claimed by ${claimer.tag}!`
          );
        }

        ticket.claimedBy = interaction.user.id;
        ticket.claimedAt = new Date();
        await ticket.save();

        const claimEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Ticket Reclamado')
          .setDescription(
            `🎫 Este ticket ahora está siendo manejado por ${interaction.user.toString()}`
          )
          .addFields(
            {
              name: 'ID del Ticket',
              value: ticket.ticketId,
              inline: true,
            },
            {
              name: 'Reclamado En',
              value: `<t:${Math.floor(ticket.claimedAt.getTime() / 1000)}:R>`,
              inline: true,
            }
          )
          .setTimestamp();

        const closeButton = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Cerrar Ticket')
          .setStyle(ButtonStyle.Danger);

        const viewClaimButton = new ButtonBuilder()
          .setCustomId('view_claim')
          .setLabel(`Reclamado por ${interaction.user.username}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(
          viewClaimButton,
          closeButton
        );

        await interaction.message.edit({ components: [row] });

        await interaction.editReply({ embeds: [claimEmbed] });

        const logChannel = interaction.guild.channels.cache.get(
          settings.logChannelId
        );
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Ticket Reclamado')
            .addFields(
              {
                name: 'Ticket',
                value: ticket.ticketId,
                inline: true,
              },
              {
                name: 'Canal',
                value: `<#${channel.id}>`,
                inline: true,
              },
              {
                name: 'Reclamado Por',
                value: interaction.user.toString(),
                inline: true,
              },
              {
                name: 'Usuario',
                value: `<@${ticket.userId}>`,
                inline: true,
              }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error('Error handling ticket claim:', error);
        await interaction.editReply(
          '❌ An error occurred while handling the ticket claim.'
        );
      }
      return;
    }

    let categoryName;
    if (interaction.isButton()) {
      if (!interaction.customId.startsWith('ticket_')) return;
      categoryName = interaction.customId.replace('ticket_', '');
    } else {
      if (interaction.customId !== 'ticket_category') return;
      categoryName = interaction.values[0];
    }

    try {
      const ticketBan = await TicketBan.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id,
      });

      if (ticketBan) {
        return interaction.reply({
          content: `❌ ¡Estás baneado de crear tickets! Razón: ${ticketBan.reason}`,
          ephemeral: true,
        });
      }

      const existingTickets = await Ticket.find({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        status: 'open',
      });

      if (existingTickets.length >= settings.ticketLimit) {
        return interaction.reply({
          content: `❌ ¡Solo puedes tener ${settings.ticketLimit} tickets abiertos a la vez!`,
          ephemeral: true,
        });
      }

      const category = await TicketCategory.findOne({
        guildId: interaction.guildId,
        name: categoryName,
      });

      if (!category) {
        return interaction.reply({
          content: '❌ Categoría de ticket inválida.',
          ephemeral: true,
        });
      }

      const ticketCount = await Ticket.countDocuments({
        guildId: interaction.guildId,
      });
      const channelName = `ticket-${categoryName.toLowerCase()}-${ticketCount + 1}`;

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: 0,
        parent: settings.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          ...settings.supportRoleIds.map((roleId) => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          })),
        ],
      });

      const ticket = new Ticket({
        guildId: interaction.guildId,
        ticketId: `${categoryName.toUpperCase()}-${ticketCount + 1}`,
        channelId: ticketChannel.id,
        userId: interaction.user.id,
        categoryId: category._id,
        categoryName: category.name,
      });
      await ticket.save();

      const welcomeEmbed = new EmbedBuilder()
        .setColor(category.color || '#DDA0DD')
        .setTitle(`Ticket de ${category.name}`)
        .setDescription(
          settings.welcomeMessage?.replace(
            '{user}',
            interaction.user.toString()
          ) ||
            `¡Bienvenido ${interaction.user.toString()}! El personal de soporte estará contigo en breve.`
        )
        .addFields(
          { name: 'Categoría', value: category.name, inline: true },
          { name: 'ID del Ticket', value: ticket.ticketId, inline: true }
        )
        .setTimestamp();

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Cerrar Ticket')
        .setStyle(ButtonStyle.Danger);

      const claimButton = new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Reclamar Ticket')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(
        claimButton,
        closeButton
      );

      await ticketChannel.send({
        content: `<@${interaction.user.id}> ${settings.supportRoleIds.map((id) => `<@&${id}>`).join(' ')}`,
        embeds: [welcomeEmbed],
        components: [row],
      });

      await interaction.reply({
        content: `✅ Tu ticket ha sido creado: ${ticketChannel}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al crear el ticket.',
        ephemeral: true,
      });
    }
  },
};
