const { autoPlayFunction } = require('../../functions/autoPlay');

module.exports = {
  name: 'trackEnd',
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);
        
    // Solo detener el collector
    if (player.collector) {
      player.collector.stop();
    }
    
    // Si no hay más canciones en la cola, intentar autoplay
    if (!player.queue.tracks?.length) {
      if (player.get('autoplay')) {
        await autoPlayFunction(player, track);
        
        // Después de agregar canciones del autoplay, reproducir la siguiente si hay alguna
        if (player.queue.tracks?.length > 0) {
          // Forzar el inicio de la siguiente canción
          await player.skip();
        }
      } else {
        // Si no hay autoplay, eliminar el mensaje después de un tiempo
        setTimeout(() => {
          if (player.queue.current?.userData?.nowPlayingMessage) {
            player.queue.current.userData.nowPlayingMessage.delete().catch(console.error);
          }
        }, 2000);
      }
    }
  },
};
