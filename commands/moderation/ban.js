const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banear a un miembro del servidor.')
    .addUserOption((option) =>
      option.setName('user').setDescription('El usuario a banear').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Razón para banear al usuario')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duración para baneo temporal (ej. "2d1h30m40s")')
        .setRequired(false)
    ),

  async execute(interaction) {
    const { default: prettyMs } = await import('pretty-ms');
    const user = interaction.options.getUser('user');
    const reason =
      interaction.options.getString('reason') || 'No se proporcionó razón.';
    const duration = interaction.options.getString('duration');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: 'El usuario no está en el servidor',
        ephemeral: true,
      });
    }
    const executor = interaction.member;
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({
        content: 'No tienes el permiso `BanMembers` para banear miembros!',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedes banear a este usuario ya que tiene un rol superior o igual.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'No puedo banear a este usuario ya que tiene un rol superior o igual al mío.',
        ephemeral: true,
      });
    }

    const durationRegex = /^(?:\d+d)?(?:\d+h)?(?:\d+m)?(?:\d+s)?$/;
    let durationInMs = null;

    if (duration) {
      if (!durationRegex.test(duration)) {
        return interaction.reply({
          content: 'Formato de duración inválido! Usa algo como `1d2h30m40s`.',
          ephemeral: true,
        });
      }
      durationInMs = parseDuration(duration);
    }

    await member.ban({ reason });

    const banEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Miembro Baneado')
      .setDescription(`⛔ ${user.tag} ha sido baneado del servidor.`)
      .addFields(
        { name: 'Razón', value: reason, inline: true },
        {
          name: 'Baneado por',
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: 'Duración',
          value: durationInMs
            ? prettyMs(durationInMs, { verbose: true })
            : 'Permanente',
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [banEmbed] });

    if (durationInMs) {
      setTimeout(async () => {
        try {
          await interaction.guild.members.unban(
            user.id,
            'Duración del baneo temporal expiró'
          );
        } catch (error) {
          console.error(`Failed to unban ${user.tag}:`, error);
        }
      }, durationInMs);
    }
  },
};

function parseDuration(duration) {
  const days =
    (duration.match(/(\d+)d/) ? parseInt(duration.match(/(\d+)d/)[1], 10) : 0) *
    24 *
    60 *
    60 *
    1000;
  const hours =
    (duration.match(/(\d+)h/) ? parseInt(duration.match(/(\d+)h/)[1], 10) : 0) *
    60 *
    60 *
    1000;
  const minutes =
    (duration.match(/(\d+)m/) ? parseInt(duration.match(/(\d+)m/)[1], 10) : 0) *
    60 *
    1000;
  const seconds =
    (duration.match(/(\d+)s/) ? parseInt(duration.match(/(\d+)s/)[1], 10) : 0) *
    1000;

  return days + hours + minutes + seconds;
}
