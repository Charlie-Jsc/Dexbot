const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Poner a un miembro en timeout por una duración específica.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('El usuario al que poner en timeout')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duración para el timeout (ej. 2d1h30m40s)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Razón para el timeout')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const { default: prettyMs } = await import('pretty-ms');

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason =
      interaction.options.getString('reason') || 'No se proporcionó razón.';
    const member = interaction.guild.members.cache.get(user.id);
    const executor = interaction.member;
    const botMember = interaction.guild.members.me;

    if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: '❌ No tienes permiso para poner miembros en timeout.',
        ephemeral: true,
      });
    }

    if (!member) {
      return interaction.reply({
        content: '❌ Ese miembro no está en este servidor.',
        ephemeral: true,
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ No puedo poner a este usuario en timeout.',
        ephemeral: true,
      });
    }

    if (member.id === executor.id) {
      return interaction.reply({
        content: '❌ No puedes ponerte en timeout a ti mismo.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          '❌ No puedes poner en timeout a este usuario ya que tiene un rol superior o igual.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: '❌ No puedo poner en timeout a este usuario debido a la jerarquía de roles.',
        ephemeral: true,
      });
    }

    const durationRegex = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;
    if (!durationRegex.test(duration)) {
      return interaction.reply({
        content: '❌ Formato de duración inválido! Usa algo como `1d2h30m40s`.',
        ephemeral: true,
      });
    }

    const durationMs = parseDuration(duration);
    if (durationMs < 5000 || durationMs > 2.419e9) {
      return interaction.reply({
        content: '❌ El timeout debe estar entre 5 segundos y 28 días.',
        ephemeral: true,
      });
    }

    try {
      await member.timeout(durationMs, reason);

      const timeoutEmbed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('🚫 Miembro Puesto en Timeout')
        .setDescription(
          `⏳ **${user.tag}** ha sido puesto en timeout por **${prettyMs(durationMs, { verbose: true })}**.`
        )
        .addFields(
          { name: 'Razón', value: reason, inline: true },
          { name: 'Puesto en Timeout por', value: `<@${executor.id}>`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [timeoutEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          '❌ Falló al poner en timeout al usuario. Por favor asegúrate de que tengo los permisos correctos.',
        ephemeral: true,
      });
    }
  },
};

function parseDuration(duration) {
  const d = (duration.match(/(\d+)d/) || [])[1] || 0;
  const h = (duration.match(/(\d+)h/) || [])[1] || 0;
  const m = (duration.match(/(\d+)m/) || [])[1] || 0;
  const s = (duration.match(/(\d+)s/) || [])[1] || 0;

  return (
    parseInt(d) * 86400000 +
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000
  );
}
