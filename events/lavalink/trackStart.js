const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { formatTime } = require('../../utils/utils');
module.exports = {
  name: 'trackStart',
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const progressBar = createProgressBar(0, track.info.duration);

    const embed = new EmbedBuilder()
      .setColor('#F0E68C')
      .setAuthor({
        name: 'Reproduciendo Ahora 🎵',
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle(track.info.title)
      .setURL(track.info.uri)
      .setDescription(
        `${progressBar}\n\`${formatTime(0)} / ${formatTime(track.info.duration)}\``
      )
      .setThumbnail(track.info.artworkUrl)
      .addFields([
        {
          name: '👤 Artista',
          value: `\`${track.info.author}\``,
          inline: true,
        },
        {
          name: '⌛ Duración',
          value: `\`${formatTime(track.info.duration)}\``,
          inline: true,
        },
        {
          name: '🎧 Solicitada por',
          value: `${track.userData?.requester || 'Desconocido'}`,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: `Volumen: ${player.volume}% | Bucle: ${player.repeatMode}`,
        iconURL:
          track.userData?.requester?.displayAvatarURL() ||
          client.user.displayAvatarURL(),
      });

    const [firstRow, secondRow] = createControlButtons();
    const controlMessage = await channel.send({
      embeds: [embed],
      components: [firstRow, secondRow],
    });

    const progressInterval = setInterval(() => {
      if (player && !player.paused) {
        const newProgressBar = createProgressBar(
          player.position,
          track.info.duration
        );
        embed.setDescription(
          `${newProgressBar}\n\`${formatTime(player.position)} / ${formatTime(track.info.duration)}\``
        );
        controlMessage.edit({ embeds: [embed] }).catch(console.error);
      }
    }, 10000);

    player.queue.current.userData.nowPlayingMessage = controlMessage;

    const collector = controlMessage.createMessageComponentCollector({});

    player.collector = collector;

    collector.on('collect', async (interaction) => {
      try {
        if (!player) {
          collector.stop();
          return;
        }

        if (!interaction.deferred && !interaction.replied) {
          await interaction.deferUpdate();
        }

        let footerText = '';

        switch (interaction.customId) {
          case 'previous':
            const previous = await player.queue.shiftPrevious();
            if (!previous) {
              await interaction.followUp({
                content: 'No se encontró pista anterior',
                ephemeral: true,
              });
              return;
            }
            await player.queue.add(previous);
            await player.queue.add(player.queue.current);
            await player.skip();
            break;

          case 'playpause':
            if (!player.paused) {
              await player.pause();
              footerText = '⏸️ Pista pausada';
            } else {
              await player.resume();
              footerText = '▶️ Pista reanudada';
            }
            break;

          case 'skip':
            if (!player.queue.tracks?.length) {
              return interaction.followUp({
                content: '¡La cola está vacía!',
                ephemeral: true,
              });
            }
            await player.skip();
            break;

          case 'loop':
            const loopModes = ['off', 'track', 'queue'];
            const currentMode = player.repeatMode;
            const currentIndex = loopModes.indexOf(currentMode);
            const nextIndex = (currentIndex + 1) % loopModes.length;
            player.setRepeatMode(loopModes[nextIndex]);
                        footerText = `🔄 Modo de bucle configurado a: ${loopModes[nextIndex]}`;
            break;

          case 'stop':
            await player.stopPlaying();
            collector.stop();
            break;

          case 'seekforward':
            if (player.position + 10000 > track.duration) {
              return interaction.followUp({
                content: `⚠️ No se puede avanzar más allá de la duración de la pista.`,
                ephemeral: true,
              });
            }
            await player.seek(player.position + 10000);
            footerText = '⏩ Avanzó 10 segundos';
            break;

          case 'seekback':
            if (player.position - 10000 < 0) {
              return interaction.followUp({
                content: '⚠️ No se puede retroceder antes del inicio de la pista.',
                ephemeral: true,
              });
            }
            await player.seek(player.position - 10000);
            footerText = '⏪ Retrocedió 10 segundos';
            break;

          case 'shuffle':
            if (!player.queue.tracks?.length) {
              return interaction.followUp({
                content: '¡La cola está vacía!',
                ephemeral: true,
              });
            }
            player.queue.shuffle();
            footerText = '🔀 Cola mezclada';
            break;

          case 'volup':
            if (player.volume + 10 > 100) {
              return interaction.followUp({
                content: '⚠️ No se puede aumentar el volumen por encima de 100',
                ephemeral: true,
              });
            }
            player.setVolume(player.volume + 10);
            footerText = `🔊 El volumen ahora es ${player.volume}`;
            break;

          case 'voldown':
            if (player.volume - 10 < 0) {
              return interaction.followUp({
                content: '⚠️ No se puede disminuir el volumen por debajo de 0',
                ephemeral: true,
              });
            }
            player.setVolume(player.volume - 10);
            footerText = `🔉 El volumen ahora es ${player.volume}`;
            break;
        }

        if (footerText) {
          embed.setFooter({ text: footerText });
          await controlMessage.edit({ embeds: [embed] });
        }
      } catch (error) {
        console.error('Error handling music control interaction:', error);
        if (!interaction.replied) {
          await interaction.followUp({
            content: '¡Hubo un error procesando ese comando!',
            ephemeral: true,
          });
        }
      }
    });

    collector.on('end', () => {
      clearInterval(progressInterval);
      if (controlMessage) {
        controlMessage.delete().catch(console.error);
      }
    });
  },
};

function createProgressBar(current, total, length = 15) {
  const progress = Math.round((current / total) * length);
  const emptyProgress = length - progress;
  const progressText = '▰'.repeat(progress);
  const emptyProgressText = '▱'.repeat(emptyProgress);
  return progressText + emptyProgressText;
}

function createControlButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('⏮️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('seekback')
        .setLabel('⏪ 10s')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('playpause')
        .setLabel('⏯️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('seekforward')
        .setLabel('10s ⏩')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⏭️')
        .setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('voldown')
        .setLabel('-10 🔉')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('loop')
        .setLabel('🔄')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('⏹️')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('🔀')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('volup')
        .setLabel('🔊 +10')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
}
