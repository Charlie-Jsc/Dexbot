const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const FILTER_NAMES = {
  nightcore: '🌙 Nightcore',
  vaporwave: '🌊 Vaporwave',
  lowPass: '⬇️ Lowpass',
  karaoke: '🎤 Karaoke',
  rotation: '🔄 Rotation',
  tremolo: '〰️ Tremolo',
  vibrato: '📳 Vibrato',
  timescale: {
    speed: '⚡ Speed',
    pitch: '🎼 Pitch',
    rate: '⏱️ Rate',
  },
  volume: '🎚️ Volume',
  equalizer: '🎛️ Bass',
  rock: '🎸 Rock',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filters')
    .setDescription('Alternar filtros de audio para la canción actual')
    .addStringOption((option) =>
      option
        .setName('filter')
        .setDescription('Selecciona un filtro para alternar')
        .setRequired(true)
        .addChoices(
          { name: '🔄 Limpiar', value: 'clear' },
          { name: '🌙 Nightcore', value: 'nightcore' },
          { name: '🌊 Vaporwave', value: 'vaporwave' },
          { name: '⬇️ Lowpass', value: 'lowpass' },
          { name: '🎤 Karaoke', value: 'karaoke' },
          { name: '🔄 Rotación', value: 'rotation' },
          { name: '〰️ Tremolo', value: 'tremolo' },
          { name: '📳 Vibrato', value: 'vibrato' },
          { name: '⚡ Velocidad', value: 'speed' },
          { name: '🎼 Tono', value: 'pitch' },
          { name: '⏱️ Tasa', value: 'rate' },
          { name: '🎚️ Volumen', value: 'volume' },
          { name: '🎛️ Bajos', value: 'bass' },
          { name: '🎧 8D', value: '8d' },
          { name: '🎸 Rock', value: 'rock' }
        )
    )
    .addNumberOption((option) =>
      option
        .setName('value')
        .setDescription(
          'Valor para el filtro (solo para velocidad, tono, tasa, volumen, bajos)'
        )
        .setMinValue(0)
        .setMaxValue(5)
    ),

  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: '❌ ¡Necesitas unirte a un canal de voz primero!',
        ephemeral: true,
      });
    }

    const player = interaction.client.lavalink.players.get(
      interaction.guild.id
    );
    if (!player) {
      return interaction.reply({
        content: '❌ ¡No se está reproduciendo música!',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channelId) {
      return interaction.reply({
        content: '❌ ¡Necesitas estar en el mismo canal de voz que yo!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const filter = interaction.options.getString('filter');
    let description = '';

    try {
      switch (filter) {
        case 'clear':
          await player.filterManager.resetFilters();
          description = '🔄 Deshabilitados todos los filtros';
          break;

        case 'nightcore':
          await player.filterManager.toggleNightcore();
          description = player.filterManager.filters.nightcore
            ? '🌙 Filtro Nightcore aplicado (deshabilitado Vaporwave si estaba activo)'
            : '🌙 Filtro Nightcore deshabilitado';
          break;

        case 'vaporwave':
          await player.filterManager.toggleVaporwave();
          description = player.filterManager.filters.vaporwave
            ? '🌊 Filtro Vaporwave aplicado (deshabilitado Nightcore si estaba activo)'
            : '🌊 Filtro Vaporwave deshabilitado';
          break;

        case 'lowpass':
          await player.filterManager.toggleLowPass();
          description = player.filterManager.filters.lowPass
            ? '⬇️ Filtro Lowpass aplicado'
            : '⬇️ Filtro Lowpass deshabilitado';
          break;

        case 'karaoke':
          await player.filterManager.toggleKaraoke();
          description = player.filterManager.filters.karaoke
            ? '🎤 Filtro Karaoke aplicado'
            : '🎤 Filtro Karaoke deshabilitado';
          break;

        case 'rotation':
          await player.filterManager.toggleRotation();
          description = player.filterManager.filters.rotation
            ? '🔄 Filtro de Rotación aplicado'
            : '🔄 Filtro de Rotación deshabilitado';
          break;

        case 'tremolo':
          await player.filterManager.toggleTremolo();
          description = player.filterManager.filters.tremolo
            ? '〰️ Filtro Tremolo aplicado'
            : '〰️ Filtro Tremolo deshabilitado';
          break;

        case 'vibrato':
          await player.filterManager.toggleVibrato();
          description = player.filterManager.filters.vibrato
            ? '📳 Filtro Vibrato aplicado'
            : '📳 Filtro Vibrato deshabilitado';
          break;

        case 'speed':
          const speedValue = interaction.options.getNumber('value');
          if (speedValue) {
            const speed = Math.max(0.5, Math.min(3, speedValue));
            await player.filterManager.setSpeed(speed);
            description = `⚡ Filtro de Velocidad aplicado (${speed}x)`;
          } else if (player.filterManager.filters.timescale?.speed !== 1) {
            await player.filterManager.setSpeed(1);
            description = '⚡ Filtro de Velocidad deshabilitado';
          } else {
            await player.filterManager.setSpeed(1.5);
            description = '⚡ Filtro de Velocidad aplicado (1.5x)';
          }
          break;

        case 'pitch':
          const pitchValue = interaction.options.getNumber('value');
          if (pitchValue) {
            const pitch = Math.max(0.5, Math.min(2, pitchValue));
            await player.filterManager.setPitch(pitch);
            description = `🎼 Filtro de Tono aplicado (${pitch}x)`;
          } else if (player.filterManager.filters.timescale?.pitch !== 1) {
            await player.filterManager.setPitch(1);
            description = '🎼 Filtro de Tono deshabilitado';
          } else {
            await player.filterManager.setPitch(1.2);
            description = '🎼 Filtro de Tono aplicado (1.2x)';
          }
          break;

        case 'rate':
          const rateValue = interaction.options.getNumber('value');
          if (rateValue) {
            const rate = Math.max(0.5, Math.min(2, rateValue));
            await player.filterManager.setRate(rate);
            description = `⏱️ Filtro de Tasa aplicado (${rate}x)`;
          } else if (player.filterManager.filters.timescale?.rate !== 1) {
            await player.filterManager.setRate(1);
            description = '⏱️ Filtro de Tasa deshabilitado';
          } else {
            await player.filterManager.setRate(1.25);
            description = '⏱️ Filtro de Tasa aplicado (1.25x)';
          }
          break;

        case 'volume':
          const volumeValue = interaction.options.getNumber('value');
          if (volumeValue) {
            const volume = Math.max(0.1, Math.min(5, volumeValue));
            await player.filterManager.setVolume(volume);
            description = `🎚️ Refuerzo de Volumen aplicado (${Math.round(volume * 100)}%)`;
          } else if (player.filterManager.filters.volume !== 1) {
            await player.filterManager.setVolume(1);
            description = '🎚️ Refuerzo de Volumen deshabilitado';
          } else {
            await player.filterManager.setVolume(1.5);
            description = '🎚️ Refuerzo de Volumen aplicado (150%)';
          }
          break;

        case 'bass':
          const bassValue = interaction.options.getNumber('value');
          if (bassValue) {
            const gain = Math.max(0.1, Math.min(3, bassValue));
            await player.filterManager.setEQ([
              { band: 0, gain: gain },
              { band: 1, gain: gain * 0.8 },
              { band: 2, gain: gain * 0.6 },
              { band: 3, gain: gain * 0.4 },
            ]);
            description = `🎛️ Refuerzo de Bajos aplicado (${Math.round(gain * 100)}%)`;
          } else if (player.filterManager.equalizerBands.length > 0) {
            await player.filterManager.clearEQ();
            description = '🎛️ Refuerzo de Bajos deshabilitado';
          } else {
            await player.filterManager.setEQ([
              { band: 0, gain: 0.6 },
              { band: 1, gain: 0.7 },
              { band: 2, gain: 0.8 },
              { band: 3, gain: 0.5 },
            ]);
            description = '🎛️ Refuerzo de Bajos aplicado';
          }
          break;

        case '8d':
          const filterEnabled = player.filterManager.filters.rotation;
          if (filterEnabled) {
            await player.filterManager.toggleRotation();
            description = '🎧 Filtro 8D deshabilitado';
          } else {
            await player.filterManager.toggleRotation(0.2);
            description = '🎧 Filtro 8D aplicado';
          }
          break;

        case 'rock':
          const rockEnabled =
            player.filterManager.equalizerBands.length > 0 &&
            player.filterManager.equalizerBands[0]?.gain === 0.3;

          if (rockEnabled) {
            await player.filterManager.clearEQ();
            description = '🎸 Filtro Rock deshabilitado';
          } else {
            await player.filterManager.setEQ([
              { band: 0, gain: 0.3 },
              { band: 1, gain: 0.25 },
              { band: 2, gain: 0.2 },
              { band: 3, gain: 0.1 },
              { band: 4, gain: 0.05 },
              { band: 5, gain: -0.05 },
              { band: 6, gain: -0.15 },
              { band: 7, gain: -0.2 },
              { band: 8, gain: -0.1 },
              { band: 9, gain: 0.1 },
              { band: 10, gain: 0.2 },
              { band: 11, gain: 0.3 },
              { band: 12, gain: 0.3 },
              { band: 13, gain: 0.25 },
              { band: 14, gain: 0.2 },
            ]);
            description = '🎸 Filtro Rock aplicado';
          }
          break;
      }

      const embed = new EmbedBuilder()
        .setColor('#DDA0DD')
        .setTitle('🎵 Gestor de Filtros')
        .setDescription(description)
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error applying filter:', error);
      await interaction.editReply({
        content: '❌ Ocurrió un error al aplicar el filtro.',
        ephemeral: true,
      });
    }
  },
};
