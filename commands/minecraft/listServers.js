const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listserverstatus')
    .setDescription('Listar todos los servidores de Minecraft que se están rastreando.'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content:
          'No tienes el permiso `ManageGuild` para ver los servidores que se están rastreando!',
        ephemeral: true,
      });
    }
    const servers = await ServerStatus.find();

    if (servers.length === 0) {
      return interaction.reply({
        content: 'Actualmente no hay configurado ningún rastreo de estado de servidor.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Rastreo de Estado de Servidores')
      .setColor('#00FF00')
      .setDescription('Aquí están todos los servidores de Minecraft que se están rastreando:');

    servers.forEach((server, index) => {
      embed.addFields({
        name: `${index + 1}. ${server.serverName} (${server.serverIp})`,
        value: `**Modo de Juego**: ${server.gameMode.toUpperCase()}\n**Canal**: <#${server.channelId}>`,
        inline: false,
      });
    });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
