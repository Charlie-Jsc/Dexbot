const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildBanRemove,
  once: false,
  async execute(ban) {
    const logSettings = await ServerLog.findOne({ guildId: ban.guild.id });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.memberEvents
    )
      return;

    const logChannel = ban.guild.channels.cache.get(logSettings.logChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Yellow')
      .setAuthor({
        name: ban.user.tag,
        iconURL: ban.user.displayAvatarURL(),
      })
      .setTitle('Miembro Desbaneado')
      .setDescription(
        `${ban.user.tag} (${ban.user.id}) ha sido desbaneado del servidor.`
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
