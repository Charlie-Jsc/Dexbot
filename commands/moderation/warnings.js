const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const warnings = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Obtener advertencias de usuario')
    .addUserOption((option) =>
      option.setName('user').setDescription('El usuario a banear').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('La página a mostrar si hay más de 1')
        .setMinValue(2)
        .setMaxValue(20)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'No tienes el permiso `KickMembers` para ver advertencias',
        ephemeral: true,
      });
    }
    const user = interaction.options.getUser('user');
    const page = interaction.options.getInteger('page');

    const userWarnings = await warnings.find({
      userId: user.id,
      guildId: interaction.guild.id,
    });

    if (!userWarnings?.length)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Registros de Advertencias del Usuario')
            .setDescription(`${user} no tiene registros de advertencias`)
            .setColor(0xff0000),
        ],
      });

    const embed = new EmbedBuilder()
      .setTitle(`Registros de advertencias de ${user.tag}`)
      .setColor(16705372);

    if (page) {
      const pageNum = 5 * page - 5;

      if (userWarnings.length >= 6) {
        embed.setFooter({
          text: `página ${page} de ${Math.ceil(userWarnings.length / 5)}`,
        });
      }

      for (const warnings of userWarnings.splice(pageNum, 5)) {
        const moderator = interaction.guild.members.cache.get(
          warnings.moderator
        );

        embed.addFields({
          name: `id: ${warnings._id}`,
          value: `
            👷🏼 Moderador: ${moderator || 'Moderador se fue'}
            👤 Usuario: <@${warnings.userId}>
            📄 Razón: ${warnings.warnReason}
            📅 Fecha: ${warnings.warnDate}
            `,
        });
      }

      return await interaction.reply({ embeds: [embed] });
    }

    if (userWarnings.length >= 6) {
      embed.setFooter({
        text: `página 1 de ${Math.ceil(userWarnings.length / 5)}`,
      });
    }

    for (const warnings of userWarnings.slice(0, 5)) {
      const moderator = interaction.guild.members.cache.get(warnings.moderator);

      embed.addFields({
        name: `id: ${warnings._id}`,
        value: `
        👷🏼 Moderador: ${moderator || 'Moderador se fue'}
        👤 Usuario: <@${warnings.userId}>
        📄 Razón: ${warnings.warnReason}
        📅 Fecha: ${warnings.warnDate}
        `,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
