const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Muestra información sobre un rol específico.')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('El rol del cual obtener información')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setColor(role.color === '0' ? 0x5865f2 : role.color)
      .setTitle(`Información de ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        {
          name: 'Miembros',
          value: role.members.size.toString(),
          inline: true,
        },
        {
          name: 'Posición',
          value: role.position.toString(),
          inline: true,
        },
        {
          name: 'Creado el',
          value: role.createdAt.toDateString(),
          inline: true,
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
