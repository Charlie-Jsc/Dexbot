const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState, newState) {
    const guildSettings = await ServerLog.findOne({
      guildId: newState.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.voiceEvents ||
      !guildSettings.logChannel
    )
      return;
    const logChannel = newState.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder().setTimestamp();

    if (!oldState.channelId && newState.channelId) {
      embed
        .setTitle('Usuario Se Unió a Canal de Voz')
        .setColor('Green')
        .addFields(
          { name: 'Usuario', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Canal',
            value: `${newState.channel.name}`,
            inline: true,
          }
        );
    } else if (oldState.channelId && !newState.channelId) {
      embed
        .setTitle('Usuario Salió del Canal de Voz')
        .setColor('Red')
        .addFields(
          { name: 'Usuario', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Canal',
            value: `${oldState.channel.name}`,
            inline: true,
          }
        );
    } else if (oldState.channelId !== newState.channelId) {
      embed
        .setTitle('Usuario Cambió de Canal de Voz')
        .setColor('Blue')
        .addFields(
          { name: 'Usuario', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Canal Anterior',
            value: `${oldState.channel.name}`,
            inline: true,
          },
          {
            name: 'Canal Nuevo',
            value: `${newState.channel.name}`,
            inline: true,
          }
        );
    }

    if (embed.data.fields) logChannel.send({ embeds: [embed] });
  },
};
