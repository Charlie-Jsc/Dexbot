module.exports = {
  name: 'queueEnd',
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);

    if (channel) {
      channel.send(
        '🔇 La cola ha terminado. ¡Agrega más canciones para seguir la fiesta!'
      );
    }
    if (player.collector) {
      player.collector.stop();
    }
  },
};
