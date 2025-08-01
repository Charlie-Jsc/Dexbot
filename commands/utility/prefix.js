const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserPrefix = require('../../models/UserPrefix');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Gestiona tu prefix personalizado para comandos')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Establece un nuevo prefix para tus comandos')
        .addStringOption(option =>
          option
            .setName('nuevo')
            .setDescription('Nuevo prefix que deseas usar (máximo 3 caracteres)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('Ver tu prefix actual')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Restablecer tu prefix al predeterminado (/)')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'set') {
      const nuevoPrefix = interaction.options.getString('nuevo');

      // Validaciones del prefix
      if (nuevoPrefix.length > 3) {
        return interaction.reply({
          content: '❌ El prefix no puede tener más de 3 caracteres.',
          ephemeral: true,
        });
      }

      if (nuevoPrefix.length === 0) {
        return interaction.reply({
          content: '❌ El prefix no puede estar vacío.',
          ephemeral: true,
        });
      }

      if (/\s/.test(nuevoPrefix)) {
        return interaction.reply({
          content: '❌ El prefix no puede contener espacios.',
          ephemeral: true,
        });
      }

      if (/[@#`]/.test(nuevoPrefix)) {
        return interaction.reply({
          content: '❌ El prefix no puede contener los caracteres: @, #, `',
          ephemeral: true,
        });
      }

      // Prefijos reservados que podrían causar conflictos
      const reservedPrefixes = ['/', '\\', '<', '>', '{', '}', '[', ']', '(', ')'];
      if (reservedPrefixes.includes(nuevoPrefix)) {
        return interaction.reply({
          content: '❌ Este prefix está reservado. Por favor elige otro.',
          ephemeral: true,
        });
      }

      try {
        // Buscar o crear el registro del usuario
        let userPrefix = await UserPrefix.findOne({ userId });

        if (!userPrefix) {
          userPrefix = new UserPrefix({ userId, prefix: nuevoPrefix });
        } else {
          userPrefix.prefix = nuevoPrefix;
        }

        await userPrefix.save();

        const successEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('✅ Prefix Actualizado')
          .setDescription(
            `Tu prefix personalizado ha sido configurado como: \`${nuevoPrefix}\`\n\n` +
            `**¿Cómo funciona?**\n` +
            `• Ahora puedes usar \`${nuevoPrefix}comando\` en lugar de \`/comando\`\n` +
            `• Ejemplo: \`${nuevoPrefix}help\`, \`${nuevoPrefix}play bohemian rhapsody\`\n` +
            `• Los comandos con \`/\` seguirán funcionando normalmente\n\n` +
            `**🎵 Comandos de música populares:**\n` +
            `• \`${nuevoPrefix}play nombre de canción\` - Reproducir música\n` +
            `• \`${nuevoPrefix}search artista\` - Buscar canciones\n` +
            `• \`${nuevoPrefix}queue view\` - Ver cola de reproducción\n` +
            `• \`${nuevoPrefix}skip\` - Saltar canción\n\n` +
            `**💡 Nota:** El prefix personalizado solo funciona para ti en todos los servidores.`
          )
          .setFooter({ 
            text: `Configurado para ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
      } catch (error) {
        console.error('Error setting user prefix:', error);
        await interaction.reply({
          content: '❌ Ocurrió un error al configurar tu prefix. Por favor inténtalo de nuevo.',
          ephemeral: true,
        });
      }
    }

    if (subcommand === 'view') {
      try {
        const userPrefix = await UserPrefix.findOne({ userId });
        const currentPrefix = userPrefix ? userPrefix.prefix : '/';

        const viewEmbed = new EmbedBuilder()
          .setColor('#2196F3')
          .setTitle('🔍 Tu Prefix Actual')
          .setDescription(
            `**Prefix configurado:** \`${currentPrefix}\`\n\n` +
            `**Ejemplos de uso:**\n` +
            `• \`${currentPrefix}help\` - Ver comandos disponibles\n` +
            `• \`${currentPrefix}play bohemian rhapsody\` - Reproducir música\n` +
            `• \`${currentPrefix}search imagine dragons\` - Buscar canciones\n` +
            `• \`${currentPrefix}queue view\` - Ver cola de reproducción\n` +
            `• \`${currentPrefix}ping\` - Verificar latencia\n\n` +
            `**Configuración:**\n` +
            `• Configurado: ${userPrefix ? `<t:${Math.floor(userPrefix.createdAt / 1000)}:R>` : 'Predeterminado'}\n` +
            `• Última actualización: ${userPrefix ? `<t:${Math.floor(userPrefix.updatedAt / 1000)}:R>` : 'N/A'}`
          )
          .setFooter({ 
            text: `Para ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setTimestamp();

        await interaction.reply({ embeds: [viewEmbed], ephemeral: true });
      } catch (error) {
        console.error('Error viewing user prefix:', error);
        await interaction.reply({
          content: '❌ Ocurrió un error al obtener tu prefix. Por favor inténtalo de nuevo.',
          ephemeral: true,
        });
      }
    }

    if (subcommand === 'reset') {
      try {
        await UserPrefix.deleteOne({ userId });

        const resetEmbed = new EmbedBuilder()
          .setColor('#FF9800')
          .setTitle('🔄 Prefix Restablecido')
          .setDescription(
            `Tu prefix ha sido restablecido al predeterminado: \`/\`\n\n` +
            `**Cambios realizados:**\n` +
            `• Se eliminó tu configuración personalizada\n` +
            `• Ahora usas el prefix estándar \`/\`\n` +
            `• Puedes volver a configurar un prefix personalizado cuando quieras\n\n` +
            `**💡 Tip:** Usa \`/prefix set nuevo_prefix\` para configurar uno nuevo.`
          )
          .setFooter({ 
            text: `Restablecido para ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setTimestamp();

        await interaction.reply({ embeds: [resetEmbed], ephemeral: true });
      } catch (error) {
        console.error('Error resetting user prefix:', error);
        await interaction.reply({
          content: '❌ Ocurrió un error al restablecer tu prefix. Por favor inténtalo de nuevo.',
          ephemeral: true,
        });
      }
    }
  },
};
