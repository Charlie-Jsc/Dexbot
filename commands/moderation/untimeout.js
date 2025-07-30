const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Quitar el timeout de un miembro.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('El usuario al que quitar el timeout')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Razón para quitar el timeout')
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

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedes quitar el timeout a este usuario ya que tiene un rol superior o igual.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedo quitar el timeout a este usuario ya que tiene un rol superior o igual al mío.',
        ephemeral: true,
      });
    }

    try {
      await member.timeout(null);

      const untimeoutEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Timeout de Miembro Removido')
        .setDescription(`✅ El usuario ${user.tag} ha sido removido del timeout.`)
        .addFields(
          { name: 'Razón', value: reason, inline: true },
          {
            name: 'Timeout removido por',
            value: interaction.user.tag,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [untimeoutEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          'Falló al remover el timeout del usuario. Por favor asegúrate de que tengo permiso para gestionar timeouts.',
        ephemeral: true,
      });
    }
  },
};
