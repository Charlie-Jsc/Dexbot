const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const Playlist = require('../../models/Playlist');
const { formatTime } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Gestionar tus playlists')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Crear una nueva playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('load')
        .setDescription('Cargar una playlist en la cola')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('addcurrent')
        .setDescription('Agregar pista actual a una playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('addqueue')
        .setDescription('Agregar todas las pistas de la cola actual a una playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Agregar una pista o playlist a tu playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de tu playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('query')
            .setDescription('URL de pista o consulta de búsqueda')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remover una pista de tu playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName('position')
            .setDescription('Posición de la pista a remover')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('Ver pistas en una playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('Listar todas tus playlists')
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Eliminar una playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Nombre de la playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand();

    if (focused.name === 'name') {
      const playlists = await Playlist.find({
        userId: interaction.user.id,
      });
      return await interaction.respond(
        playlists
          .filter((p) =>
            p.name.toLowerCase().includes(focused.value.toLowerCase())
          )
          .map((p) => ({
            name: `${p.name} (${p.tracks.length} pistas)`,
            value: p.name,
          }))
      );
    }

    if (subcommand === 'add' && focused.name === 'query') {
      if (!focused.value.trim()) {
        return await interaction.respond([
          {
            name: 'Comienza a escribir para buscar canciones...',
            value: 'start_typing',
          },
        ]);
      }

      const player = interaction.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        textChannelId: interaction.channelId,
      });

      try {
        const results = await player.search({
          query: focused.value,
          source: 'spsearch',
        });

        if (!results?.tracks?.length) {
          return await interaction.respond([
            {
              name: 'No se encontraron resultados',
              value: 'no_results',
            },
          ]);
        }

        let options = [];
        if (results.loadType === 'playlist') {
          options = [
            {
              name: `📑 Playlist: ${results.playlist?.title || 'Desconocida'} (${results.tracks.length} pistas)`,
              value: focused.value,
            },
          ];
        } else {
          options = results.tracks.slice(0, 25).map((track) => ({
            name: `${track.info.title} - ${track.info.author}`,
            value: track.info.uri,
          }));
        }

        return await interaction.respond(options);
      } catch (error) {
        return await interaction.respond([
          {
            name: 'Error buscando pistas',
            value: 'error',
          },
        ]);
      }
    }
  },

  async execute(interaction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'create': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.create({
            userId: interaction.user.id,
            name,
            tracks: [],
          });

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Playlist Creada')
            .setDescription(`Se creó la playlist con éxito: **${name}**`)
            .addFields({
              name: '📑 Pistas',
              value: '`0 pistas`',
              inline: true,
            })
            .setFooter({
              text: `Creada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'load': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          if (!interaction.member.voice.channel) {
            return await interaction.editReply(
              '❌ ¡Primero debes unirte a un canal de voz!'
            );
          }

          let player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );
          if (!player) {
            player = interaction.client.lavalink.createPlayer({
              guildId: interaction.guild.id,
              voiceChannelId: interaction.member.voice.channel.id,
              textChannelId: interaction.channel.id,
              selfDeaf: true,
            });
            await player.connect();
          }

          const loadEmbed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Cargando Playlist')
            .setDescription(
              `Cargando **${playlist.tracks.length}** pistas de la playlist: **${name}**`
            )
            .addFields([
              {
                name: '📑 Playlist',
                value: `\`${name}\``,
                inline: true,
              },
              {
                name: '⌛ Duración Total',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Cargada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [loadEmbed] });

          for (const track of playlist.tracks) {
            const result = await player.search({
              query: track.uri,
              source: 'spsearch',
            });

            if (result?.tracks?.[0]) {
              result.tracks[0].userData = {
                requester: interaction.member,
              };
              await player.queue.add(result.tracks[0]);
            }
          }

          if (!player.playing) await player.play();

          return await interaction.editReply(
            `✅ Se cargaron ${playlist.tracks.length} pistas de la playlist: ${name}`
          );
        }

        case 'addcurrent': {
          const name = interaction.options.getString('name');
          const player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );

          if (!player?.queue?.current) {
            return await interaction.editReply(
              '❌ ¡No se está reproduciendo nada en este momento!'
            );
          }

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          const track = player.queue.current;
          playlist.tracks.push({
            title: track.info.title,
            uri: track.info.uri,
            author: track.info.author,
            duration: track.info.duration,
            artworkUrl: track.info.artworkUrl,
          });
          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Pista Agregada a la Playlist')
            .setDescription(`Se agregó la pista a la playlist: **${name}**`)
            .setThumbnail(track.info.artworkUrl)
            .addFields([
              {
                name: '🎵 Pista',
                value: `[${track.info.title}](${track.info.uri})`,
                inline: true,
              },
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
                name: '📑 Pistas de la Playlist',
                value: `\`${playlist.tracks.length} pistas\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Agregada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'addqueue': {
          const name = interaction.options.getString('name');
          const player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );

          if (!player?.queue?.current) {
            return await interaction.editReply(
              '❌ ¡No se está reproduciendo nada en este momento!'
            );
          }

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          playlist.tracks.push({
            title: player.queue.current.info.title,
            uri: player.queue.current.info.uri,
            author: player.queue.current.info.author,
            duration: player.queue.current.info.duration,
            artworkUrl: player.queue.current.info.artworkUrl,
          });

          for (const track of player.queue.tracks) {
            playlist.tracks.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
              artworkUrl: track.info.artworkUrl,
            });
          }

          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Cola Agregada a la Playlist')
            .setDescription(
              `Se agregaron **${player.queue.tracks.length + 1}** pistas a la playlist: **${name}**`
            )
            .addFields([
              {
                name: '📑 Pistas Agregadas',
                value: `\`${player.queue.tracks.length + 1} pistas\``,
                inline: true,
              },
              {
                name: '📝 Total de Pistas',
                value: `\`${playlist.tracks.length} pistas\``,
                inline: true,
              },
              {
                name: '⌛ Duración Total',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Agregada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'add': {
          const name = interaction.options.getString('name');
          const query = interaction.options.getString('query');

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          const player = interaction.client.lavalink.createPlayer({
            guildId: interaction.guild.id,
            textChannelId: interaction.channel.id,
          });

          const results = await player.search({
            query,
            source: 'spsearch',
          });

          if (!results?.tracks?.length) {
            return await interaction.editReply('❌ ¡No se encontraron pistas!');
          }

          if (results.loadType === 'playlist') {
            for (const track of results.tracks) {
              playlist.tracks.push({
                title: track.info.title,
                uri: track.info.uri,
                author: track.info.author,
                duration: track.info.duration,
                artworkUrl: track.info.artworkUrl,
              });
            }
            await playlist.save();
            return await interaction.editReply(
              `✅ Se agregaron ${results.tracks.length} pistas de la playlist a: ${name}`
            );
          } else {
            const track = results.tracks[0];
            playlist.tracks.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
              artworkUrl: track.info.artworkUrl,
            });
            await playlist.save();
            return await interaction.editReply(
              `✅ Se agregó "${track.info.title}" a la playlist: ${name}`
            );
          }
        }

        case 'remove': {
          const name = interaction.options.getString('name');
          const position = interaction.options.getInteger('position') - 1;

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          if (position < 0 || position >= playlist.tracks.length) {
            return await interaction.editReply('❌ ¡Posición de pista inválida!');
          }

          const removedTrack = playlist.tracks.splice(position, 1)[0];
          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Pista Eliminada de la Playlist')
            .setDescription(`Se eliminó la pista de la playlist: **${name}**`)
            .addFields([
              {
                name: '🎵 Pista Eliminada',
                value: `[${removedTrack.title}](${removedTrack.uri})`,
                inline: false,
              },
              {
                name: '📑 Pistas Restantes',
                value: `\`${playlist.tracks.length} pistas\``,
                inline: true,
              },
              {
                name: '⌛ Duración de la Pista',
                value: `\`${formatTime(removedTrack.duration)}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Eliminada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'view': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          const tracksPerPage = 10;
          const totalPages = Math.ceil(playlist.tracks.length / tracksPerPage);
          let currentPage = 1;

          const generateEmbed = (page) => {
            const start = (page - 1) * tracksPerPage;
            const end = start + tracksPerPage;
            const tracks = playlist.tracks.slice(start, end);

            const totalDuration = playlist.tracks.reduce(
              (acc, track) => acc + track.duration,
              0
            );

            const embed = new EmbedBuilder()
              .setColor('#F0E68C')
              .setTitle(`🎵 Playlist: ${playlist.name}`)
              .setDescription(
                tracks.length
                  ? tracks
                      .map(
                        (track, i) =>
                          `\`${start + i + 1}.\` [${track.title}](${track.uri})\n` +
                          `┗ 👤 \`${track.author}\` • ⌛ \`${formatTime(track.duration)}\``
                      )
                      .join('\n\n')
                  : 'No hay pistas en esta playlist'
              )
              .addFields([
                {
                  name: '📑 Total de Pistas',
                  value: `\`${playlist.tracks.length} pistas\``,
                  inline: true,
                },
                {
                  name: '⌛ Duración Total',
                  value: `\`${formatTime(totalDuration)}\``,
                  inline: true,
                },
              ])
              .setFooter({
                text: `Página ${page}/${totalPages} • Usa los botones para navegar`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTimestamp();

            return embed;
          };

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setEmoji('⬅️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === 1),
            new ButtonBuilder()
              .setCustomId('next')
              .setEmoji('➡️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === totalPages)
          );

          const message = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: totalPages > 1 ? [row] : [],
          });

          if (totalPages > 1) {
            const collector = message.createMessageComponentCollector({
              filter: (i) => i.user.id === interaction.user.id,
              time: 60000,
            });

            collector.on('collect', async (buttonInteraction) => {
              try {
                if (!buttonInteraction.deferred) {
                  await buttonInteraction.deferUpdate();
                }

                if (buttonInteraction.customId === 'prev' && currentPage > 1) {
                  currentPage--;
                } else if (
                  buttonInteraction.customId === 'next' &&
                  currentPage < totalPages
                ) {
                  currentPage++;
                }

                const updatedRow = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 1),
                  new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages)
                );

                await buttonInteraction.message.edit({
                  embeds: [generateEmbed(currentPage)],
                  components: [updatedRow],
                });
              } catch (error) {
                console.error(
                  'Error handling playlist view interaction:',
                  error
                );
              }
            });

            collector.on('end', () => {
              const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('prev')
                  .setEmoji('⬅️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId('next')
                  .setEmoji('➡️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true)
              );

              message.edit({ components: [disabledRow] }).catch(console.error);
            });
          }
          break;
        }

        case 'list': {
          const playlists = await Playlist.find({
            userId: interaction.user.id,
          });

          if (!playlists.length) {
            return await interaction.editReply('❌ ¡No tienes playlists!');
          }

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('📑 Tus Playlists')
            .setDescription(
              playlists
                .map((p) => `**${p.name}** - ${p.tracks.length} pistas`)
                .join('\n')
            )
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'delete': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOneAndDelete({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ ¡Playlist no encontrada!');
          }

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Playlist Eliminada')
            .setDescription(`Se eliminó la playlist con éxito: **${name}**`)
            .addFields([
              {
                name: '📑 Pistas Eliminadas',
                value: `\`${playlist.tracks.length} pistas\``,
                inline: true,
              },
              {
                name: '⌛ Duración Total',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Eliminada por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Playlist command error:', error);
      return await interaction.editReply(
        '❌ Ocurrió un error al procesar el comando.'
      );
    }
  },
};
