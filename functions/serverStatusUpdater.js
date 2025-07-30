const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const ServerStatus = require('../models/ServerStatus');

module.exports = async (client) => {
  const updateServerStatus = async () => {
    const servers = await ServerStatus.find();

    // Calculate the global next update timestamp
    const nextUpdateTimestamp = Date.now() + 30000;
    const nextUpdateDiscordTimestamp = Math.floor(nextUpdateTimestamp / 1000);
    const formattedTimestamp = `↳ <t:${nextUpdateDiscordTimestamp}:R>`;

    for (const server of servers) {
      const { guildId, channelId, serverName, serverIp, gameMode, messageId } =
        server;

      const guild = await client.guilds.fetch(guildId).catch(() => null);
      if (!guild) continue;

      const channel = guild.channels.cache.get(channelId);
      if (!channel || !channel.isTextBased()) continue;

      const apiUrl =
        gameMode === 'java'
          ? `https://api.mcsrvstat.us/1/${serverIp}`
          : `https://api.mcsrvstat.us/bedrock/1/${serverIp}`;

      try {
        const { data } = await axios.get(apiUrl);

        // Build the embed
        const embed = new EmbedBuilder()
          .setColor(data.offline ? '#FF0000' : '#008080')
          .setTitle(data.offline ? '❌ Servidor Desconectado' : serverName)
          .setDescription(
            data.offline
              ? `El servidor \`${serverIp}\` está actualmente desconectado.`
              : '**Servidor En Línea** 🟢'
          )
          .addFields({
            name: '⏱ Próxima Actualización',
            value: formattedTimestamp,
            inline: true,
          })
          .setFooter({
            text: 'Última actualización',
            iconURL: `https://api.mcstatus.io/v2/icon/${serverIp}`,
          })
          .setThumbnail(`https://api.mcstatus.io/v2/icon/${serverIp}`)
          .setTimestamp();

        if (!data.offline) {
          embed.addFields(
            {
              name: '🖥 Dirección IP',
              value: `↳ \`${data.ip}\``,
              inline: true,
            },
            {
              name: '🛜 Puerto',
              value: `↳ \`${data.port}\``,
              inline: true,
            },
            {
              name: '🗺 Nombre de Host',
              value: '↳ `' + data.hostname + '`' || 'Desconocido',
              inline: false,
            },
            {
              name: '📊 Jugadores En Línea',
              value: `↳ \`${data.players?.online || 0}\` / **${
                data.players?.max || 0
              }**`,
              inline: false,
            },
            {
              name: '🔧 Versión',
              value: '↳ **' + data.version + '**' || 'Desconocido',
              inline: false,
            },
            {
              name: '🌅 MOTD',
              value: `\`\`\`ansi\n\x1b[36m${data.motd?.clean[0]?.trim() || ''}\n${
                data.motd?.clean[1]?.trim() || ''
              }\x1b[0m\`\`\``,
            }
          );
        }

        // Update the message or send a new one
        if (messageId) {
          const statusMessage = await channel.messages
            .fetch(messageId)
            .catch(() => null);

          if (statusMessage) {
            await statusMessage.edit({ embeds: [embed] });
          } else {
            const newMessage = await channel.send({
              embeds: [embed],
            });
            server.messageId = newMessage.id; // Update message ID in DB
            await server.save();
          }
        } else {
          const newMessage = await channel.send({ embeds: [embed] });
          server.messageId = newMessage.id; // Save the message ID in DB
          await server.save();
        }
      } catch (error) {
        console.error(
          `Error fetching status for server "${serverName}" (${serverIp} - ${gameMode}):`,
          error
        );

        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Error')
          .setDescription(
            `Ocurrió un error al obtener el estado del servidor \`${serverIp}\`.`
          )
          .setTimestamp();

        if (messageId) {
          const statusMessage = await channel.messages
            .fetch(messageId)
            .catch(() => null);

          if (statusMessage) {
            await statusMessage.edit({ embeds: [errorEmbed] });
          } else {
            const newMessage = await channel.send({
              embeds: [errorEmbed],
            });
            server.messageId = newMessage.id; // Update message ID in DB
            await server.save();
          }
        } else {
          const newMessage = await channel.send({
            embeds: [errorEmbed],
          });
          server.messageId = newMessage.id; // Save the message ID in DB
          await server.save();
        }
      }
    }
  };

  setInterval(updateServerStatus, 30000);
  await updateServerStatus(); // Run immediately on startup
};
