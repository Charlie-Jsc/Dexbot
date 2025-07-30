const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const TicketSettings = require('../../models/TicketSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Configurar el sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName('support_role')
        .setDescription('Rol que puede ver los tickets')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('category')
        .setDescription('Categoría para los tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('logs')
        .setDescription('Canal para los logs de tickets')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('Máximo de tickets por usuario')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '¡No tienes permisos de `Administrador` para configurar Tickets!',
        ephemeral: true,
      });
    }
    const supportRole = interaction.options.getRole('support_role');
    const category = interaction.options.getChannel('category');
    const logs = interaction.options.getChannel('logs');
    const limit = interaction.options.getInteger('limit') || 3;

    try {
      await TicketSettings.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          guildId: interaction.guildId,
          enabled: true,
          categoryId: category.id,
          logChannelId: logs.id,
          supportRoleIds: [supportRole.id],
          ticketLimit: limit,
        },
        { upsert: true, new: true }
      );

      await interaction.reply({
        content: '✅ ¡El sistema de tickets ha sido configurado exitosamente!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Ocurrió un error al configurar el sistema de tickets.',
        ephemeral: true,
      });
    }
  },
};
