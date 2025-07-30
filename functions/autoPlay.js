async function autoPlayFunction(player, lastPlayedTrack) {
  console.log('🤖 AutoPlay iniciado...');
  
  if (!player.get('autoplay')) {
    console.log('❌ Autoplay deshabilitado');
    return;
  }
  if (player.get('autoplay') == false) {
    console.log('❌ Autoplay es false');
    return;
  }
  if (!lastPlayedTrack) {
    console.log("❌ Autoplay doesn't have a lastPlayedTrack to reference.");
    return;
  }

  console.log('🎵 Última canción:', lastPlayedTrack.info.title, 'Fuente:', lastPlayedTrack.info.sourceName);

  if (
    lastPlayedTrack.info.sourceName === 'youtube' ||
    lastPlayedTrack.info.sourceName === 'youtubemusic'
  ) {
    try {
      const res = await player.search(
        {
          query: `https://www.youtube.com/watch?v=${lastPlayedTrack.info.identifier}&list=RD${lastPlayedTrack.info.identifier}`,
          source: 'youtube',
        },
        lastPlayedTrack.requester
      );

      res.tracks = res.tracks.filter(
        (track) => track.info.identifier !== lastPlayedTrack.info.identifier
      );

      if (res && res.tracks.length) {
        const tracksToAdd = res.tracks.slice(0, 5).map((track) => {
          track.pluginInfo.clientData = {
            ...(track.pluginInfo.clientData || {}),
            fromAutoplay: true,
          };
          // Asegurar que tenga información del requester original
          track.userData = {
            requester: lastPlayedTrack.userData?.requester || lastPlayedTrack.requester,
          };
          return track;
        });
        
        await player.queue.add(tracksToAdd);
        console.log(`🎵 Autoplay agregó ${tracksToAdd.length} canciones a la cola`);
      }
    } catch (error) {
      console.warn('Error fetching YouTube autoplay track:', error);
    }
    return;
  }
}

module.exports = { autoPlayFunction };
