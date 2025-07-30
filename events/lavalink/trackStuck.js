module.exports = {
  name: 'trackStuck',
  async execute(client, player, track, thresholdMs) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      channel.send(
        `⚠️ La pista \`${track.info.title}\` se ha quedado atascada durante más de ${thresholdMs}ms. Saltando a la siguiente pista.`
      );
    }
    player.skip();
  },
};
