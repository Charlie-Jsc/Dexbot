const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const { path } = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription(
      'Nukear el canal de texto actual clonándolo y eliminando el original.'
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({
        content: 'No tienes el permiso `ManageChannels` para nukear miembros!',
        ephemeral: true,
      });
    }
    const channelToNuke = interaction.channel;

    if (channelToNuke.type !== 0) {
      return interaction.reply(
        'Este comando solo puede ser usado en canales de texto.'
      );
    }

    try {
      const channelName = channelToNuke.name;
      const channelPosition = channelToNuke.position;

      const newChannel = await channelToNuke.clone({
        name: channelName,
        position: channelPosition,
        reason: 'Canal nukeado por comando',
      });

      await channelToNuke.delete('Canal nukeado por comando');
      const attachment = new AttachmentBuilder('./utils/nuke.gif');
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💣 ¡Canal Nukeado! 💣')
        .setImage('attachment://nuke.gif')
        .setFooter({ text: `Nukeado por ${interaction.user.tag}.` })
        .setTimestamp();

      const nukeMessage = await newChannel.send({
        embeds: [embed],
        files: [attachment],
      });

      setTimeout(async () => {
        await nukeMessage.delete();
      }, 30000);
    } catch (error) {
      console.error('Error during nuke operation:', error);
      await interaction.reply('Hubo un error tratando de nukear el canal.');
    }
  },
};
