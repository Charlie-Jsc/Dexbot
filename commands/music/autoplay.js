const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription(
      'Alternar autoplay para reproducir pistas recomendadas cuando la cola esté vacía.'
    ),
  async execute(interaction) {
    const client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.connected) {
      return interaction.reply({
        content: '❌ ¡No estoy conectado a ningún canal de voz!',
        ephemeral: true,
      });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: '❌ ¡Debes estar en un canal de voz!',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channelId) {
      return interaction.reply({
        content: '❌ ¡Debes estar en el mismo canal de voz que yo!',
        ephemeral: true,
      });
    }

    // Solo verificar la fuente si hay una pista actual reproduciéndose
    if (
      player.queue.current && 
      player.queue.current.info.sourceName !== 'youtube' &&
      player.queue.current.info.sourceName !== 'youtubemusic'
    ) {
      return interaction.reply({
        content: `❌ **El autoplay no es compatible con ${player.queue.current.info.sourceName}**\n\n🎵 **Para usar autoplay:**\n• Reproduce música desde **YouTube** o **YouTube Music**\n• Usa \`/play canción\` para buscar en YouTube\n• El autoplay se activará automáticamente con esas fuentes`,
        ephemeral: true,
      });
    }

    const autoplay = player.get('autoplay') || false;
    player.set('autoplay', !autoplay);

    return interaction.reply(
      `✅ **¡Autoplay está ahora ${!autoplay ? 'habilitado' : 'deshabilitado'}!**`
    );
  },
};
