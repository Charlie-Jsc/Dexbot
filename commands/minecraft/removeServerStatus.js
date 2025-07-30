const { SlashCommandBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeserverstatus')
    .setDescription('Remover un servidor de Minecraft del rastreo.')
    .addStringOption((option) =>
      option
        .setName('servername')
        .setDescription('El nombre del servidor a remover.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('La dirección IP del servidor a remover.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content:
          'No tienes el permiso `ManageGuild` para remover el estado del servidor!',
        ephemeral: true,
      });
    }
    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');

    const server = await ServerStatus.findOneAndDelete({
      serverName,
      serverIp,
    });

    if (!server) {
      return interaction.reply({
        content: `No se encontró ningún servidor con el nombre **${serverName}** e IP **${serverIp}**.`,
        ephemeral: true,
      });
    }

    if (server.messageId) {
      try {
        const channel = await interaction.guild.channels.fetch(
          server.channelId
        );
        const message = await channel.messages.fetch(server.messageId);
        await message.delete();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }

    return interaction.reply({
      content: `Se removió exitosamente el rastreo de estado del servidor para **${serverName}** (\`${serverIp}\`).`,
      ephemeral: true,
    });
  },
};
