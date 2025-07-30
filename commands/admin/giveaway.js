const { SlashCommandBuilder } = require('@discordjs/builders');
const startGiveaway = require('../../functions/startGiveaway');
const endGiveaway = require('../../functions/endGiveaway');
const rerollGiveaway = require('../../functions/rerollGiveaway');
const listGiveaways = require('../../functions/listGiveaway');
const cancelGiveaway = require('../../functions/cancelGiveaway');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Gestiona sorteos')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Inicia un nuevo sorteo')
        .addStringOption((option) =>
          option
            .setName('duration')
            .setDescription('La duración del sorteo (ej., 1d1h1m1s)')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('prize')
            .setDescription('El premio del sorteo')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('winners')
            .setDescription('Número de ganadores para el sorteo')
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('required_role')
            .setDescription('Opcional: Rol requerido para participar en el sorteo')
        )
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Opcional: Canal para alojar el sorteo.')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reroll')
        .setDescription('Rehacer el sorteo para seleccionar nuevos ganadores')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('El ID del mensaje del sorteo')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('Termina un sorteo en curso')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('El ID del mensaje del sorteo')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cancel')
        .setDescription('Cancela un sorteo en curso')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('El ID del mensaje del sorteo')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Lista todos los sorteos en curso en el servidor')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          '¡No tienes el permiso de `Administrador` para gestionar sorteos!',
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'start':
        await startGiveaway(interaction);
        break;
      case 'reroll':
        await rerollGiveaway(interaction);
        break;
      case 'end':
        await endGiveaway(interaction);
        break;
      case 'cancel':
        await cancelGiveaway(interaction);
        break;
      case 'list':
        await listGiveaways(interaction);
        break;
      default:
        await interaction.reply({
          content: 'Invalid subcommand!',
          ephemeral: true,
        });
    }
  },
};
