const { SlashCommandBuilder, EmbedBuilder, Role } = require('discord.js');
const AutoRole = require('../../models/AutoRoles'); // The model to store the auto-role

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configura el sistema de roles automáticos para nuevos miembros')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Establece roles para asignar automáticamente a nuevos miembros')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('El rol a asignar a nuevos miembros')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Elimina un rol del sistema de roles automáticos')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('El rol a eliminar de las asignaciones automáticas')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('Ver todos los roles asignados a nuevos miembros')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          '¡No tienes el permiso de `Administrador` para gestionar roles automáticos!',
        ephemeral: true,
      });
    }
    const { options, guild } = interaction;
    const subcommand = options.getSubcommand();
    const serverId = guild.id;

    // Fetch existing auto-role data for the server
    let autoRole = await AutoRole.findOne({ serverId });

    if (!autoRole) {
      autoRole = new AutoRole({ serverId, roleIds: [] });
      await autoRole.save();
    }

    if (subcommand === 'add') {
      const role = options.getRole('role');
      if (autoRole.roleIds.includes(role.id)) {
        return interaction.reply({
          content: `El rol ${role.name} ya está configurado como rol automático.`,
          ephemeral: true,
        });
      }
      autoRole.roleIds.push(role.id);
      await autoRole.save();

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('Roles Automáticos Actualizados')
        .setDescription(
          `El rol ${role.name} ha sido añadido a la lista de roles automáticos. Los nuevos miembros recibirán automáticamente este rol cuando se unan.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remove') {
      const role = options.getRole('role');
      if (!autoRole.roleIds.includes(role.id)) {
        return interaction.reply({
          content: `El rol ${role.name} no está configurado como rol automático.`,
          ephemeral: true,
        });
      }
      autoRole.roleIds = autoRole.roleIds.filter((id) => id !== role.id);
      await autoRole.save();

      const embed = new EmbedBuilder()
        .setColor('#FF5733')
        .setTitle('Rol Automático Eliminado')
        .setDescription(
          `El rol ${role.name} ha sido eliminado de la lista de roles automáticos.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'view') {
      if (autoRole.roleIds.length === 0) {
        return interaction.reply({
          content: 'No se han configurado roles automáticos para este servidor.',
          ephemeral: true,
        });
      }

      const roleNames = autoRole.roleIds
        .map((roleId) => {
          const role = guild.roles.cache.get(roleId);
          return role ? role.name : `Rol Desconocido (ID: ${roleId})`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('Roles Automáticos Configurados')
        .setDescription(
          `Los siguientes roles se asignan automáticamente a nuevos miembros cuando se unen:\n\n\`${roleNames}\``
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
