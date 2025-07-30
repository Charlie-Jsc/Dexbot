const {
  Events,
  EmbedBuilder,
  ChannelType,
  AuditLogEvent,
} = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ChannelDelete,
  once: false,
  async execute(channel) {
    if (!channel.guild) return;

    const logSettings = await ServerLog.findOne({
      guildId: channel.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.channelEvents
    )
      return;

    const logChannel = channel.guild.channels.cache.get(logSettings.logChannel);
    if (!logChannel) return;

    const fetchedLogs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelDelete,
      limit: 1,
    });
    const deletionLog = fetchedLogs.entries.first();
    const deleter = deletionLog ? `<@${deletionLog.executor.id}>` : 'Desconocido';

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('Canal Eliminado')
      .addFields(
        { name: 'Nombre', value: channel.name, inline: true },
        {
          name: 'Tipo',
          value: `${ChannelType[channel.type] || 'Desconocido'}`,
          inline: true,
        },
        { name: 'Eliminado Por', value: deleter, inline: true }
      )
      .setFooter({ text: `ID del Canal: ${channel.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
