const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole, newRole) {
    const guildSettings = await ServerLog.findOne({
      guildId: newRole.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.roleEvents ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = newRole.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('Rol Actualizado')
      .setColor('Orange')
      .addFields({
        name: 'Rol',
        value: `<@&${newRole.id}> (${newRole.id})`,
      });

    let hasChanges = false;

    if (oldRole.name !== newRole.name) {
      embed.addFields({
        name: 'Nombre Cambiado',
        value: `**Anterior:** ${oldRole.name}\n**Nuevo:** ${newRole.name}`,
      });
      hasChanges = true;
    }

    if (oldRole.color !== newRole.color) {
      embed.addFields({
        name: 'Color Cambiado',
        value: `**Anterior:** ${oldRole.hexColor}\n**Nuevo:** ${newRole.hexColor}`,
      });
      hasChanges = true;
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      const oldPermissions = oldRole.permissions.toArray().join(', ') || 'Ninguno';
      const newPermissions = newRole.permissions.toArray().join(', ') || 'Ninguno';
      embed.addFields({
        name: 'Permisos Cambiados',
        value: `**Anteriores:** ${oldPermissions}\n**Nuevos:** ${newPermissions}`,
      });
      hasChanges = true;
    }

    if (hasChanges) {
      embed.setTimestamp();
      logChannel.send({ embeds: [embed] });
    }
  },
};
