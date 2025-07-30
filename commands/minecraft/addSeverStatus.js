const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');
const serverStatusUpdater = require('../../functions/serverStatusUpdater');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addserverstatus')
    .setDescription('Agregar un servidor de Minecraft para rastrear su estado.')
    .addStringOption((option) =>
      option
        .setName('servername')
        .setDescription('El nombre del servidor.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('La dirección IP del servidor.')
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
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('El canal donde se publicará el estado del servidor.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content:
          'No tienes el permiso `ManageGuild` para agregar estado del servidor!',
        ephemeral: true,
      });
    }
    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');
    const channel = interaction.options.getChannel('channel');

    const guildId = interaction.guild.id;
    const channelId = channel.id;

    const existingEntry = await ServerStatus.findOne({
      guildId,
      serverIp,
      channelId,
    });

    if (existingEntry) {
      return interaction.reply({
        content:
          '¡Este servidor ya está siendo rastreado en el canal especificado!',
        ephemeral: true,
      });
    }

    const newServerStatus = new ServerStatus({
      guildId,
      channelId,
      serverName,
      serverIp,
      gameMode,
    });

    await newServerStatus.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#008080')
          .setTitle('✅ Rastreo de Estado del Servidor Agregado')
          .setDescription(
            `Se agregó exitosamente el rastreo de estado del servidor para **${serverName}** (\`${serverIp}\`, ${gameMode.toUpperCase()}) en <#${channelId}>.`
          )
          .addFields({
            name: '⏱ Por Favor Nota',
            value: `La primera actualización aparecerá en breve. ¡Por favor espera el próximo ciclo de actualización!`,
            inline: false,
          })
          .setFooter({
            text: 'El rastreo de estado se actualizará cada 30 segundos.',
          })
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
