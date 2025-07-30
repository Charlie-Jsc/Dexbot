const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.MessageDelete,
  once: false,
  async execute(message) {
    if (!message.guild || message.author?.bot || message.partial) return;

    const logSettings = await ServerLog.findOne({
      guildId: message.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.messages
    )
      return;

    const logChannel = message.guild.channels.cache.get(logSettings.logChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(
        `**Mensaje eliminado en ${message.channel}:**\n${message.content || '*Contenido del mensaje no disponible*'}`
      )
      .setFooter({ text: `ID del Usuario: ${message.author.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
