const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar a un miembro del servidor.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('El usuario a expulsar')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Razón para expulsar al usuario')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason =
      interaction.options.getString('reason') || 'No se proporcionó razón.';
    const member = interaction.guild.members.cache.get(user.id);
    const executor = interaction.member;
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );

    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'No tienes el permiso `KickMembers` para expulsar miembros!',
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content:
          'No puedo expulsar a este usuario. Podría tener un rol superior al mío o me faltan permisos.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedes expulsar a este usuario ya que tiene un rol superior o igual.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedo expulsar a este usuario ya que tiene un rol superior o igual al mío.',
        ephemeral: true,
      });
    }

    await member.kick(reason);

    const kickEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Miembro Expulsado')
      .setDescription(`👢 ${user.tag} ha sido expulsado del servidor.`)
      .addFields(
        { name: 'Razón', value: reason, inline: true },
        { name: 'Expulsado por', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [kickEmbed] });
  },
};
