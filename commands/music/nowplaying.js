const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime, createProgressBar } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Mostrar información sobre la pista que se está reproduciendo actualmente'),
  async execute(interaction) {
    const client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '🎵 ¡No se está reproduciendo nada ahora mismo!',
        ephemeral: true,
      });
    }

    const current = player.queue.current;
    const progress = createProgressBar(player.position, current.info.duration);
    const queueLength = player.queue.tracks.length;

    const embed = new EmbedBuilder()
      .setColor('#B0C4DE')
      .setAuthor({
        name: 'Reproduciendo Ahora 🎵',
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle(current.info.title)
      .setURL(current.info.uri)
      .setDescription(
        `${progress}\n\`${formatTime(player.position)} / ${formatTime(current.info.duration)}\``
      )
      .setThumbnail(current.info.artworkUrl)
      .addFields([
        {
          name: '👤 Artista',
          value: `\`${current.info.author}\``,
          inline: true,
        },
        {
          name: '🎧 Solicitado por',
          value: current.requester ? `${player.requester}` : 'Desconocido',
          inline: true,
        },
        {
          name: '🎶 A Continuación',
          value:
            queueLength > 0
              ? `${queueLength} pista${queueLength === 1 ? '' : 's'}`
              : 'Nada en cola',
          inline: true,
        },
        {
          name: '🔊 Volumen',
          value: `\`${player.volume}%\``,
          inline: true,
        },
        {
          name: '🔄 Modo de Repetición',
          value: `\`${player.repeatMode.charAt(0).toUpperCase() + player.repeatMode.slice(1)}\``,
          inline: true,
        },
        {
          name: '⏯️ Estado',
          value: `\`${player.paused ? 'Pausado' : 'Reproduciendo'}\``,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: `Servidor: ${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
