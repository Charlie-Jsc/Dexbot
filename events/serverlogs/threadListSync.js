const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadListSync,
  once: false,
  async execute(threads) {
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

    const threadNames =
      threads.threads.map((thread) => thread.name).join(', ') || 'Ninguno';

    const embed = new EmbedBuilder()
      .setTitle('Lista de Hilos Sincronizada')
      .setColor('Blue')
      .setDescription('La lista de hilos del servidor fue sincronizada.')
      .addFields({
        name: 'Hilos Sincronizados',
        value: `${threadNames}`,
        inline: false,
      })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
