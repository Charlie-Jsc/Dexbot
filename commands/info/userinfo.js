const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información sobre un usuario.')
    .addUserOption((option) =>
      option.setName('target').setDescription('Selecciona un usuario')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Información de ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        {
          name: 'Se Unió al Servidor el',
          value: member.joinedAt.toDateString(),
          inline: true,
        },
        {
          name: 'Cuenta Creada el',
          value: user.createdAt.toDateString(),
          inline: true,
        },
        {
          name: 'Roles',
          value:
            member.roles.cache
              .filter((role) => role.id !== interaction.guild.id)
              .map((role) => role.toString())
              .join(', ') || 'Ninguno',
          inline: false,
        }
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
