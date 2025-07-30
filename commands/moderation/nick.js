const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Cambiar tu apodo o el de otro usuario.")
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(
          'El usuario al que cambiar el apodo (deja en blanco para cambiar el tuyo)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('nickname')
        .setDescription('El nuevo apodo')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const nickname = interaction.options.getString('nickname');

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return await interaction.reply('Usuario no encontrado en este servidor.');
    }

    if (
      interaction.member.permissions.has('ManageNicknames') ||
      user.id === interaction.user.id
    ) {
      try {
        await member.setNickname(nickname);
        return await interaction.reply(
          `El apodo de **${user.username}** ha sido cambiado a **${nickname}**.`
        );
      } catch (error) {
        console.error(error);
        return await interaction.reply(
          "No puedo cambiar el apodo de este usuario. Por favor verifica mis permisos."
        );
      }
    } else {
      return await interaction.reply(
        'No tienes el permiso `ManageNicknames` para cambiar apodos.'
      );
    }
  },
};
