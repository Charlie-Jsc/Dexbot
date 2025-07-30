const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const TicketSettings = require('../../models/TicketSettings');
const TicketCategory = require('../../models/TicketCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Crear un panel de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Canal donde enviar el panel de tickets')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('style')
        .setDescription('Estilo del panel')
        .setRequired(true)
        .addChoices(
          { name: 'Botones', value: 'buttons' },
          { name: 'Menú de Selección', value: 'select' }
        )
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Título del panel').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('messageid')
        .setDescription(
          'ID del mensaje a usar como descripción (debe estar en el mismo canal que el panel)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('categories')
        .setDescription(
          'Nombres de categorías separados por coma (ej: soporte,facturación,ayuda)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('color')
        .setDescription('Color del panel (hex)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const settings = await TicketSettings.findOne({
      guildId: interaction.guildId,
    });
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          '¡No tienes permisos de `Administrador` para crear un panel de tickets!',
        ephemeral: true,
      });
    }
    if (!settings?.enabled) {
      return interaction.reply({
        content: '❌ ¡El sistema de tickets no está configurado! Usa `/ticketsetup` primero.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    const style = interaction.options.getString('style');
    const title = interaction.options.getString('title');
    const messageId = interaction.options.getString('messageid');
    const categoriesInput = interaction.options.getString('categories');
    const color = interaction.options.getString('color') || '#DDA0DD';

    try {
      const descriptionMessage = await channel.messages.fetch(messageId);
      if (!descriptionMessage) {
        return interaction.reply({
          content:
            '❌ No se pudo encontrar un mensaje con esa ID en el canal especificado.',
          ephemeral: true,
        });
      }

      const categoryNames = categoriesInput.split(',').map((c) => c.trim());
      const categories = await TicketCategory.find({
        guildId: interaction.guildId,
        name: { $in: categoryNames },
      });

      if (categories.length === 0) {
        return interaction.reply({
          content:
            '❌ ¡No se encontró ninguna de las categorías especificadas! Créalas usando `/ticketcategory add` primero.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(descriptionMessage.content)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Sistema de Tickets Lanya' });

      let components = [];

      if (style === 'buttons') {
        const rows = [];
        let currentRow = new ActionRowBuilder();
        let buttonCount = 0;

        for (const category of categories) {
          if (buttonCount === 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonCount = 0;
          }

          const button = new ButtonBuilder()
            .setCustomId(`ticket_${category.name}`)
            .setLabel(category.name)
            .setEmoji(category.emoji)
            .setStyle(ButtonStyle.Primary);

          currentRow.addComponents(button);
          buttonCount++;
        }

        if (buttonCount > 0) {
          rows.push(currentRow);
        }

        components = rows;
      } else {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('ticket_category')
          .setPlaceholder('Selecciona una categoría')
          .addOptions(
            categories.map((cat) => ({
              label: cat.name,
              description: cat.description,
              value: cat.name,
              emoji: cat.emoji,
            }))
          );

        components = [new ActionRowBuilder().addComponents(selectMenu)];
      }

      await channel.send({
        embeds: [embed],
        components: components,
      });

      await interaction.reply({
        content: `✅ ¡Panel de tickets creado en ${channel}!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error creating panel:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al crear el panel.',
        ephemeral: true,
      });
    }
  },
};
