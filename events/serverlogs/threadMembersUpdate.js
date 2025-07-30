const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadMembersUpdate,
  once: false,
  async execute(oldMembers, newMembers, thread) {
    const guildSettings = await ServerLog.findOne({
      guildId: thread.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.threadEvents ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = thread.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const addedMembers = [...newMembers.keys()].filter(
      (id) => !oldMembers.has(id)
    );
    const removedMembers = [...oldMembers.keys()].filter(
      (id) => !newMembers.has(id)
    );

    const embed = new EmbedBuilder()
      .setTitle('Miembros del Hilo Actualizados')
      .setColor('Purple')
      .addFields(
        { name: 'Nombre del Hilo', value: `${thread.name}`, inline: true },
        { name: 'ID del Hilo', value: `${thread.id}`, inline: true }
      )
      .setTimestamp();

    if (addedMembers.length > 0) {
      embed.addFields({
        name: 'Miembros Agregados',
        value: addedMembers.map((id) => `<@${id}>`).join(', ') || 'Ninguno',
        inline: false,
      });
    }

    if (removedMembers.length > 0) {
      embed.addFields({
        name: 'Miembros Removidos',
        value: removedMembers.map((id) => `<@${id}>`).join(', ') || 'Ninguno',
        inline: false,
      });
    }

    if (addedMembers.length === 0 && removedMembers.length === 0) return;

    logChannel.send({ embeds: [embed] });
  },
};
