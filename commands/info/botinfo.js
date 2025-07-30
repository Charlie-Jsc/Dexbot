const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const moment = require('moment');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Muestra información sobre el bot.'),

  async execute(interaction) {
    const { client } = interaction;
    const totalGuilds = client.guilds.cache.size;
    const totalMembers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    const uptime = moment.duration(client.uptime).humanize();

    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
      2
    );
    const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
    const cpuUsage = os.loadavg()[0].toFixed(2);
    const cpuModel = os.cpus()[0].model;
    const operatingSystem = `${os.type()} ${os.release()}`;

    const botInfoEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${client.user.username} - Información del Bot`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: 'Desarrollador',
          value: '```elm\nGaurav & Neppixel\n```',
          inline: true,
        },
        {
          name: 'Servidores',
          value: '```elm\n' + totalGuilds + '\n```',
          inline: true,
        },
        {
          name: 'Usuarios',
          value: '```elm\n' + totalMembers + '\n```',
          inline: true,
        },
        {
          name: 'Tiempo Activo',
          value: '```elm\n' + uptime + '\n```',
          inline: true,
        },
        {
          name: 'Uso de CPU',
          value: '```elm\n' + cpuUsage + '%\n```',
          inline: true,
        },
        {
          name: 'Uso de RAM',
          value: '```elm\n' + memoryUsage + ' MB / ' + totalMemory + ' MB\n```',
          inline: true,
        },
        {
          name: 'Modelo de CPU',
          value: '```elm\n' + cpuModel + '\n```',
          inline: true,
        },
        {
          name: 'Sistema Operativo',
          value: '```elm\n' + operatingSystem + '\n```',
          inline: true,
        },
        {
          name: 'Creado el',
          value:
            '```elm\n' +
            moment(client.user.createdAt).format('MMMM Do YYYY, h:mm:ss A') +
            '\n```',
          inline: true,
        },
        {
          name: 'Librería',
          value: '```elm\ndiscord.js v14\n```',
          inline: true,
        }
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const sourceCodeButton = new ButtonBuilder()
      .setLabel('Código Fuente')
      .setURL('https://github.com/gaurav87565/Lanya-2.0')
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(sourceCodeButton);

    await interaction.reply({ embeds: [botInfoEmbed], components: [row] });
  },
};
