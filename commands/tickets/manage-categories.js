const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const TicketCategory = require('../../models/TicketCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketcategory')
    .setDescription('Gestionar categorías de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Agregar una nueva categoría de tickets')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Nombre de la categoría')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('description')
            .setDescription('Descripción de la categoría')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('emoji')
            .setDescription('Emoji para la categoría')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Eliminar una categoría de tickets')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Nombre de la categoría a eliminar')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('Listar todas las categorías de tickets')
    ),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
          content:
            '¡No tienes permisos de `Administrador` para gestionar categorías de tickets!',
          ephemeral: true,
        });
      }
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'add': {
          const name = interaction.options.getString('name');
          const description = interaction.options.getString('description');
          const emoji = interaction.options.getString('emoji');

          const existingCategory = await TicketCategory.findOne({
            guildId: interaction.guildId,
            name: name,
          });

          if (existingCategory) {
            return interaction.reply({
              content: '❌ ¡Ya existe una categoría con ese nombre!',
              ephemeral: true,
            });
          }

          await TicketCategory.create({
            guildId: interaction.guildId,
            name: name,
            description: description,
            emoji: emoji,
          });

          await interaction.reply({
            content: `✅ Se agregó la categoría de tickets: ${emoji} ${name}`,
            ephemeral: true,
          });
          break;
        }
        case 'remove': {
          const name = interaction.options.getString('name');
          const result = await TicketCategory.findOneAndDelete({
            guildId: interaction.guildId,
            name: name,
          });

          if (!result) {
            return interaction.reply({
              content: '❌ ¡Categoría no encontrada!',
              ephemeral: true,
            });
          }

          await interaction.reply({
            content: `✅ Se eliminó la categoría de tickets: ${name}`,
            ephemeral: true,
          });
          break;
        }
        case 'list': {
          const categories = await TicketCategory.find({
            guildId: interaction.guildId,
          });

          if (categories.length === 0) {
            return interaction.reply({
              content:
                '❌ ¡No se encontraron categorías de tickets! Crea algunas usando `/ticketcategory add`',
              ephemeral: true,
            });
          }

          const embed = new EmbedBuilder()
            .setTitle('Categorías de Tickets')
            .setColor('#DDA0DD')
            .setDescription(
              categories
                .map(
                  (cat) => `${cat.emoji} **${cat.name}**\n${cat.description}`
                )
                .join('\n\n')
            );

          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error managing ticket categories:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al gestionar las categorías de tickets.',
        ephemeral: true,
      });
    }
  },
};
