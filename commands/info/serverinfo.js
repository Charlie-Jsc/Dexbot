const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información sobre el servidor.'),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'ID del Servidor', value: guild.id, inline: true },
        { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
        {
          name: 'Cantidad de Miembros',
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: 'Creado el',
          value: guild.createdAt.toDateString(),
          inline: true,
        },
        {
          name: 'Total de Roles',
          value: `${guild.roles.cache.size}`,
          inline: true,
        },
        { name: 'Región', value: guild.preferredLocale, inline: true }
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
