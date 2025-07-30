const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildSettings = await ServerLog.findOne({
      guildId: newMember.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.boosts ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = newMember.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    if (!oldMember.premiumSince && newMember.premiumSince) {
      const embed = new EmbedBuilder()
        .setTitle('Impulso del Servidor')
        .setColor('Purple')
        .setDescription(`<@${newMember.id}> ha impulsado el servidor!`)
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    } else if (oldMember.premiumSince && !newMember.premiumSince) {
      const embed = new EmbedBuilder()
        .setTitle('Impulso Removido')
        .setColor('Red')
        .setDescription(`<@${newMember.id}> ha removido su impulso del servidor.`)
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  },
};
