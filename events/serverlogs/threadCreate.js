const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadCreate,
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
      .setTitle('Hilo Creado')
      .setColor('Green')
      .setDescription(`Se ha creado un nuevo hilo en <#${thread.parentId}>`)
      .addFields(
        { name: 'Nombre del Hilo', value: `${thread.name}`, inline: true },
        { name: 'ID del Hilo', value: `${thread.id}`, inline: true },
        { name: 'Tipo de Hilo', value: `${thread.type}`, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
