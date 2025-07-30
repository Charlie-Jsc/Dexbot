module.exports = {
  name: 'trackError',
  async execute(client, player, track, error) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      channel.send(
        `❌ Hubo un error al reproducir la pista: \`${track.info.title}\`. Saltando a la siguiente pista.`
      );
    }
    console.error(`Error with track ${track.info.title}:`, error);
  },
};
