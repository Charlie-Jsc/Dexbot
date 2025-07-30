const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    const logSettings = await ServerLog.findOne({
      guildId: member.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.memberEvents
    )
      return;

    const logChannel = member.guild.channels.cache.get(logSettings.logChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL(),
      })
      .setTitle('Miembro Se Fue')
      .setDescription(`<@${member.id}> ha dejado el servidor.`)
      .setFooter({ text: `ID del Usuario: ${member.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
