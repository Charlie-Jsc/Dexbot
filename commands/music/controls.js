const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controls')
    .setDescription('Controles básicos de reproducción')
    .addSubcommand((subcommand) =>
      subcommand.setName('join').setDescription('Unirse al canal de voz')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('pause').setDescription('Pausar la pista actual')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('resume').setDescription('Reanudar reproducción')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('skip').setDescription('Saltar a la siguiente pista')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Detener reproducción y limpiar la cola')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('leave').setDescription('Salir del canal de voz')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('shuffle').setDescription('Mezclar aleatoriamente el orden de la cola')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('seek')
        .setDescription('Ir a la posición deseada de la canción')
        .addStringOption((option) =>
          option.setName('time').setDescription('Tiempo al que quieres ir')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('volume')
        .setDescription('Cambia el volumen del reproductor')
        .addIntegerOption((option) =>
          option
            .setName('set')
            .setDescription('Volumen')
            .setRequired(true)
            .setMaxValue(100)
            .setMinValue(0)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('skipto')
        .setDescription('Salta a la canción específica en la cola')
        .addIntegerOption((option) =>
          option
            .setName('position')
            .setDescription('La posición a la que quieres saltar')
            .setRequired(true)
            .setMinValue(1)
        )
    ),
  async execute(interaction) {
    client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);
    const subcommand = interaction.options.getSubcommand();
    if (subcommand != 'join') {
      if (!player) {
        return interaction.reply({
          content: '¡No se está reproduciendo nada!',
          ephemeral: true,
        });
      }
    }

    switch (subcommand) {
      case 'join':
        if (!player) {
          client.lavalink
            .createPlayer({
              guildId: interaction.guild.id,
              voiceChannelId: interaction.member.voice.channel.id,
              textChannelId: interaction.channel.id,
              selfDeaf: true,
            })
            .connect();
          return interaction.reply(
            `🎵 Se unió a <#${interaction.member.voice.channel.id}>`
          );
        } else {
          return interaction.reply(
            `Ya estoy en el canal de voz <#${player.voiceChannelId}>`
          );
        }
        break;

      case 'pause':
        await player.pause();
        interaction.reply('⏸️ Pausado');
        break;
      case 'resume':
        await player.resume();
        interaction.reply('▶️ Reanudado');
        break;
      case 'skip':
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: '¡La cola está vacía!',
            ephemeral: true,
          });
        }
        await player.skip();
        interaction.reply('⏭️ Saltado');
        break;
      case 'skipto':
        skipPos = interaction.options.getInteger('position');
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: '¡La cola está vacía!',
            ephemeral: true,
          });
        }
        if (player.queue.tracks?.length < skipPos) {
          return interaction.reply({
            content: "No se puede saltar más que el tamaño de la cola",
            ephemeral: true,
          });
        }
        await player.skip(skipPos);
        interaction.reply(`⏭️ Saltado a \`${skipPos}\``);
        break;
      case 'stop':
        await player.stopPlaying();
        interaction.reply('⏹️ Detenido');
        break;
      case 'leave':
        await player.destroy();
        interaction.reply('👋 Salí del canal de voz');
        break;
      case 'shuffle':
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: '¡La cola está vacía!',
            ephemeral: true,
          });
        }
        player.queue.shuffle();
        interaction.reply('🔀 Cola mezclada');
        break;
      case 'volume':
        const vol = interaction.options.getInteger('set');
        player.setVolume(vol);
        interaction.reply(`🔊 Volumen establecido a \`${vol}\``);
        break;
      case 'seek':
        const timeInput = interaction.options.getString('time').trim();
        const timeParts = timeInput.split(':').map(Number);

        let seekTime = 0;
        if (timeParts.length === 1) {
          seekTime = timeParts[0];
        } else if (timeParts.length === 2) {
          seekTime = timeParts[0] * 60 + timeParts[1];
        } else if (timeParts.length === 3) {
          seekTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          return interaction.editReply(
            '❌ Formato de tiempo inválido. Usa `hh:mm:ss`, `mm:ss`, o `ss`.'
          );
        }

        seekTime *= 1000;

        const trackDuration = player.queue.current.duration;
        if (seekTime < 0 || seekTime > trackDuration) {
          return interaction.editReply(
            `❌ El tiempo de búsqueda está fuera de rango. La duración de la pista es **${formatDuration(trackDuration)}**.`
          );
        }

        await player.seek(seekTime);
        return interaction.reply(
          `⏩ **Buscado a:** \`${formatDuration(seekTime)}\``
        );
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
