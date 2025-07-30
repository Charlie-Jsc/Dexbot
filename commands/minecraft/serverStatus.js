const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Obtener el estado de un servidor de Minecraft.')
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('La dirección IP del servidor de Minecraft.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('gamemode')
        .setDescription('El modo de juego del servidor (Java o Bedrock).')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    ),

  async execute(interaction) {
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');

    const apiUrl =
      gameMode === 'java'
        ? `https://api.mcsrvstat.us/1/${serverIp}`
        : `https://api.mcsrvstat.us/bedrock/1/${serverIp}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.offline) {
        const offlineEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`❌ Servidor Desconectado`)
          .setDescription(`El servidor en \`${serverIp}\` está actualmente desconectado.`)
          .addFields(
            {
              name: '🖥 Dirección IP',
              value: `↳ \`${serverIp}\``,
              inline: true,
            },
            {
              name: '🛜 Puerto',
              value: `↳ \`${data.port || 'Unknown'}\``,
              inline: true,
            }
          )
          .setFooter({ text: 'Last updated' })
          .setTimestamp();

        return interaction.reply({ embeds: [offlineEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#008080')
        .setTitle(`${serverIp}`)
        .setDescription('**Servidor En Línea** 🟢')
        .addFields(
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
            name: '🗺 Nombre del Host',
            value: '↳ `' + data.hostname + '`' || 'Unknown',
            inline: false,
          },
          {
            name: '📊 Jugadores En Línea',
            value: `↳ \`${data.players?.online || 0}\` / **${data.players?.max || 0}**`,
            inline: false,
          },
          {
            name: '🔧 Versión',
            value: '↳ **' + data.version + '**' || 'Unknown',
            inline: false,
          },
          {
            name: '🌅 MOTD',
            value: `\`\`\`ansi\n\x1b[36m${data.motd?.clean[0]?.trim() || ''}\n${
              data.motd?.clean[1]?.trim() || ''
            }\x1b[0m\`\`\``,
          }
        )
        .setFooter({ text: 'Last updated' })
        .setTimestamp()
        .setThumbnail(`https://api.mcstatus.io/v2/icon/${serverIp}`);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply(
        `There was an error fetching the status for ${serverIp}.`
      );
    }
  },
};
