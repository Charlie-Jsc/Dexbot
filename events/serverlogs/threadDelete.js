const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadDelete,
  once: false,
  async execute(thread) {
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

    const embed = new EmbedBuilder()
      .setTitle('Hilo Eliminado')
      .setColor('Red')
      .setDescription(`Se ha eliminado un hilo de <#${thread.parentId}>`)
      .addFields(
        { name: 'Nombre del Hilo', value: `${thread.name}`, inline: true },
        { name: 'ID del Hilo', value: `${thread.id}`, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
