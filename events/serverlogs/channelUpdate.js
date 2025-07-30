const {
  Events,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel) {
    if (!oldChannel.guild) return;

    const logSettings = await ServerLog.findOne({
      guildId: oldChannel.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.channelEvents
    )
      return;

    const logChannel = oldChannel.guild.channels.cache.get(
      logSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle('Canal Actualizado')
      .setFooter({ text: `ID del Canal: ${newChannel.id}` })
      .setTimestamp();

    let changesDetected = false;

    if (oldChannel.name !== newChannel.name) {
      embed.addFields(
        { name: 'Nombre Anterior', value: oldChannel.name, inline: true },
        { name: 'Nombre Nuevo', value: newChannel.name, inline: true }
      );
      changesDetected = true;
    }

    if (
      oldChannel.type === ChannelType.GuildText &&
      oldChannel.topic !== newChannel.topic
    ) {
      embed.addFields(
        {
          name: 'Tema Anterior',
          value: oldChannel.topic || 'Ninguno',
          inline: true,
        },
        {
          name: 'Tema Nuevo',
          value: newChannel.topic || 'Ninguno',
          inline: true,
        }
      );
      changesDetected = true;
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
      embed.addFields(
        {
          name: 'Estado NSFW Anterior',
          value: oldChannel.nsfw ? 'Habilitado' : 'Deshabilitado',
          inline: true,
        },
        {
          name: 'Estado NSFW Nuevo',
          value: newChannel.nsfw ? 'Habilitado' : 'Deshabilitado',
          inline: true,
        }
      );
      changesDetected = true;
    }

    if (oldChannel.type === ChannelType.GuildVoice) {
      if (oldChannel.bitrate !== newChannel.bitrate) {
        embed.addFields(
          {
            name: 'Bitrate Anterior',
            value: `${oldChannel.bitrate / 1000} kbps`,
            inline: true,
          },
          {
            name: 'Bitrate Nuevo',
            value: `${newChannel.bitrate / 1000} kbps`,
            inline: true,
          }
        );
        changesDetected = true;
      }

      if (oldChannel.userLimit !== newChannel.userLimit) {
        embed.addFields(
          {
            name: 'Límite de Usuarios Anterior',
            value: oldChannel.userLimit || 'Ilimitado',
            inline: true,
          },
          {
            name: 'Límite de Usuarios Nuevo',
            value: newChannel.userLimit || 'Ilimitado',
            inline: true,
          }
        );
        changesDetected = true;
      }
    }

    if (oldChannel.parentId !== newChannel.parentId) {
      const oldCategory = oldChannel.parent ? oldChannel.parent.name : 'Ninguna';
      const newCategory = newChannel.parent ? newChannel.parent.name : 'Ninguna';
      embed.addFields(
        { name: 'Categoría Anterior', value: oldCategory, inline: true },
        { name: 'Categoría Nueva', value: newCategory, inline: true }
      );
      changesDetected = true;
    }

    const oldPerms = oldChannel.permissionOverwrites.cache;
    const newPerms = newChannel.permissionOverwrites.cache;

    const updatedPerms = newPerms.filter((newPerm) => {
      const oldPerm = oldPerms.get(newPerm.id);
      return (
        !oldPerm ||
        oldPerm.allow.bitfield !== newPerm.allow.bitfield ||
        oldPerm.deny.bitfield !== newPerm.deny.bitfield
      );
    });

    const removedPerms = oldPerms.filter(
      (oldPerm) => !newPerms.has(oldPerm.id)
    );

    if (updatedPerms.size > 0) {
      embed.addFields({
        name: 'Updated Permissions',
        value: updatedPerms
          .map((perm) => {
            const changes = [];
            const oldPerm = oldPerms.get(perm.id);

            if (oldPerm) {
              const addedPerms = new PermissionsBitField(
                perm.allow.bitfield & ~oldPerm.allow.bitfield
              )
                .toArray()
                .join(', ');
              const removedPerms = new PermissionsBitField(
                oldPerm.allow.bitfield & ~perm.allow.bitfield
              )
                .toArray()
                .join(', ');

              if (addedPerms) changes.push(`**Added**: ${addedPerms}`);
              if (removedPerms) changes.push(`**Removed**: ${removedPerms}`);
            } else {
              const allowed = new PermissionsBitField(perm.allow.bitfield)
                .toArray()
                .join(', ');
              if (allowed) changes.push(`**Allowed**: ${allowed}`);
            }

            const denied = new PermissionsBitField(perm.deny.bitfield)
              .toArray()
              .join(', ');
            if (denied) changes.push(`**Denied**: ${denied}`);

            return `<@&${perm.id}>: ${changes.join(' | ')}`;
          })
          .join('\n'),
        inline: false,
      });
      changesDetected = true;
    }

    if (removedPerms.size > 0) {
      embed.addFields({
        name: 'Removed Permissions',
        value: removedPerms
          .map((perm) => `<@${perm.id}>: All permissions removed`)
          .join('\n'),
        inline: false,
      });
      changesDetected = true;
    }

    if (changesDetected) {
      logChannel.send({ embeds: [embed] });
    }
  },
};
