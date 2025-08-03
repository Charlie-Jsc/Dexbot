const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits 
} = require('discord.js');
const BroadcastLog = require('../../models/BroadcastLog');
const broadcastRateLimit = require('../../utils/broadcastRateLimit');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Sistema de anuncios y difusión a servidores'),
    // 🔒 Sin permisos predeterminados - manejo interno de seguridad

  async execute(interaction) {
    // 🛡️ Verificación de seguridad - Solo propietarios autorizados
    const botOwners = process.env.BOT_OWNERS ? 
      process.env.BOT_OWNERS.split(',').map(id => id.trim()) : 
      [];
    
    if (!botOwners.includes(interaction.user.id)) {
      const accessDeniedEmbed = new EmbedBuilder()
        .setTitle('🔒 Acceso Denegado')
        .setDescription('Solo los propietarios autorizados del bot pueden usar este comando.')
        .setColor('#FF0000')
        .setFooter({ text: 'Sistema de Broadcast - Dexbot' })
        .setTimestamp();

      return interaction.reply({
        embeds: [accessDeniedEmbed],
        ephemeral: true
      });
    }

    // 🚦 Verificar rate limiting
    const rateLimitCheck = broadcastRateLimit.verifyBroadcastPermission(interaction.user.id);
    if (!rateLimitCheck.allowed) {
      const rateLimitEmbed = new EmbedBuilder()
        .setTitle('🚦 Límite de Uso Alcanzado')
        .setDescription(rateLimitCheck.message)
        .setColor('#FF5733')
        .setTimestamp()
        .setFooter({ 
          text: `Razón: ${rateLimitCheck.reason} | Reintenta en ${Math.ceil(rateLimitCheck.retryAfter / 60)} min` 
        });

      // 📊 Agregar estadísticas de uso si está disponible
      const usageStats = broadcastRateLimit.getUsageStats(interaction.user.id);
      if (usageStats.user) {
        rateLimitEmbed.addFields({
          name: '📊 Tu Uso Actual',
          value: 
            `**Por hora:** ${usageStats.user.hourly}/${usageStats.user.maxHourly}\n` +
            `**Por día:** ${usageStats.user.daily}/${usageStats.user.maxDaily}\n` +
            `**Cooldown:** ${Math.ceil(usageStats.user.cooldownRemaining / 1000 / 60)} min`,
          inline: true
        });
      }

      return interaction.reply({
        embeds: [rateLimitEmbed],
        ephemeral: true
      });
    }

    // 📝 Crear modal para introducir datos del broadcast
    const modal = new ModalBuilder()
      .setCustomId('broadcast_modal')
      .setTitle('📢 Crear Anuncio de Broadcast');

    // �️ Campo de título
    const titleInput = new TextInputBuilder()
      .setCustomId('broadcast_title')
      .setLabel('Título del Anuncio')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(256)
      .setPlaceholder('Ej: Nueva Actualización de Dexbot v2.0');

    // 📄 Campo de descripción (con soporte para saltos de línea)
    const descriptionInput = new TextInputBuilder()
      .setCustomId('broadcast_description')
      .setLabel('Descripción/Contenido del Mensaje')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(4000)
      .setPlaceholder('Escribe aquí el contenido del anuncio...\nPuedes usar saltos de línea y markdown.');

    // 🖼️ Campo de imagen (opcional)
    const imageInput = new TextInputBuilder()
      .setCustomId('broadcast_image')
      .setLabel('URL de Imagen/GIF (Opcional)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('https://ejemplo.com/imagen.png (.jpg, .jpeg, .gif)');

    // 🎨 Campo de configuración adicional
    const configInput = new TextInputBuilder()
      .setCustomId('broadcast_config')
      .setLabel('Configuración Adicional (Opcional)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setPlaceholder('Thumbnail: https://ejemplo.com/thumb.png\nColor: #FF5733');

    // � Agregar campos al modal
    const titleRow = new ActionRowBuilder().addComponents(titleInput);
    const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const imageRow = new ActionRowBuilder().addComponents(imageInput);
    const configRow = new ActionRowBuilder().addComponents(configInput);

    modal.addComponents(titleRow, descriptionRow, imageRow, configRow);

    // 📤 Mostrar modal al usuario
    await interaction.showModal(modal);

    // 📝 Log de inicio de sesión
    console.log(`🔐 [BROADCAST] ${interaction.user.tag} (${interaction.user.id}) abrió el modal de broadcast`);
  },

  // 🔧 Función para manejar la respuesta del modal
  async handleModalSubmit(interaction) {
    // 🔍 Verificar que es el modal correcto
    if (interaction.customId !== 'broadcast_modal') return;

    await interaction.deferReply({ ephemeral: true });

    // 📝 Obtener datos del modal
    const titulo = interaction.fields.getTextInputValue('broadcast_title');
    const descripcion = interaction.fields.getTextInputValue('broadcast_description');
    const imagenUrl = interaction.fields.getTextInputValue('broadcast_image') || null;
    const configText = interaction.fields.getTextInputValue('broadcast_config') || '';

    // 🔧 Procesar configuración adicional
    let thumbnailUrl = null;
    let color = '#00BFFF';

    if (configText) {
      const configLines = configText.split('\n');
      for (const line of configLines) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          if (key.toLowerCase().includes('thumbnail')) {
            thumbnailUrl = value;
          } else if (key.toLowerCase().includes('color')) {
            color = value.startsWith('#') ? value : `#${value}`;
          }
        }
      }
    }

    // 🔍 Validar URLs de imagen (si se proporcionan)
    const imageValidation = validateImageUrl(imagenUrl);
    const thumbnailValidation = validateImageUrl(thumbnailUrl);

    if (!imageValidation.valid && imagenUrl) {
      return interaction.editReply({
        content: `❌ **Error en imagen principal:** ${imageValidation.error}`,
      });
    }

    if (!thumbnailValidation.valid && thumbnailUrl) {
      return interaction.editReply({
        content: `❌ **Error en miniatura:** ${thumbnailValidation.error}`,
      });
    }

    // 🎨 Crear embed de vista previa
    const previewEmbed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setTimestamp()
      .setFooter({ 
        text: `Anuncio oficial de ${interaction.client.user.username}`,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    if (imagenUrl) previewEmbed.setImage(imagenUrl);
    if (thumbnailUrl) previewEmbed.setThumbnail(thumbnailUrl);

    // 📊 Obtener estadísticas de servidores
    const guilds = interaction.client.guilds.cache;
    const totalServers = guilds.size;
    const totalMembers = guilds.reduce((sum, guild) => sum + guild.memberCount, 0);
    
    // Contar servidores con canales disponibles
    let serversWithChannels = 0;
    for (const guild of guilds.values()) {
      const hasChannel = findBestChannel(guild);
      if (hasChannel) serversWithChannels++;
    }

    // 📋 Embed de información del broadcast
    const infoEmbed = new EmbedBuilder()
      .setTitle('📢 Vista Previa del Anuncio')
      .setDescription(
        `**📊 Alcance estimado:**\n` +
        `🌐 **Servidores:** ${totalServers.toLocaleString()}\n` +
        `👥 **Usuarios:** ${totalMembers.toLocaleString()}\n` +
        `✅ **Canales disponibles:** ${serversWithChannels}/${totalServers}\n\n` +
        `**⚠️ El anuncio se enviará a todos los servidores después de confirmar.**`
      )
      .setColor('#FFD700')
      .setTimestamp()
      .setFooter({ text: 'Confirma el envío usando el botón de abajo' });

    // 🎛️ Crear botones de selección de audiencia
    const audienceButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('broadcast_all_servers')
          .setLabel('🌐 Enviar a Todos los Servidores')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📢')
      );

    const controlButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('broadcast_preview')
          .setLabel('👁️ Previsualizar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('broadcast_cancel')
          .setLabel('❌ Cancelar')
          .setStyle(ButtonStyle.Danger)
      );

    // 📤 Enviar vista previa con botones
    const response = await interaction.editReply({
      content: `🔒 **Solo visible para ti** - Vista previa del anuncio:`,
      embeds: [previewEmbed, infoEmbed],
      components: [audienceButtons, controlButtons],
    });

    // ⏱️ Collector para manejar interacciones de botones
    const collector = response.createMessageComponentCollector({ 
      time: 300000 // 5 minutos
    });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return buttonInteraction.reply({
          content: '❌ Solo el usuario que ejecutó el comando puede usar estos botones.',
          ephemeral: true
        });
      }

      await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === 'broadcast_cancel') {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('❌ Broadcast Cancelado')
          .setDescription('El anuncio no fue enviado.')
          .setColor('#FF0000')
          .setTimestamp();

        await buttonInteraction.editReply({
          embeds: [cancelEmbed],
          components: []
        });
        collector.stop();
        return;
      }

      if (buttonInteraction.customId === 'broadcast_preview') {
        // Mostrar solo la vista previa sin botones
        await buttonInteraction.editReply({
          content: '👁️ **Vista Previa del Anuncio:**',
          embeds: [previewEmbed],
          components: [audienceButtons, controlButtons]
        });
        return;
      }

      // 🚀 Ejecutar broadcast
      let targetGuilds = [];
      let audienceType = '';

      if (buttonInteraction.customId === 'broadcast_all_servers') {
        targetGuilds = Array.from(guilds.values());
        audienceType = 'Todos los Servidores';
      }

      // 📊 Mostrar progreso inicial
      const progressEmbed = new EmbedBuilder()
        .setTitle('🚀 Iniciando Broadcast...')
        .setDescription(
          `**🎯 Público objetivo:** ${audienceType}\n` +
          `**📊 Servidores objetivo:** ${targetGuilds.length}\n` +
          `**⏱️ Tiempo estimado:** ${Math.ceil(targetGuilds.length * 1.5)} segundos\n\n` +
          `🔄 **Estado:** Preparando envío...`
        )
        .setColor('#FFA500')
        .setTimestamp();

      await buttonInteraction.editReply({
        embeds: [progressEmbed],
        components: []
      });

      // 🚀 Ejecutar el broadcast
      await executeBroadcast(
        targetGuilds, 
        previewEmbed, 
        interaction.client, 
        buttonInteraction,
        audienceType,
        interaction.user,
        { titulo, descripcion, imagenUrl, thumbnailUrl, color }
      );

      // ✅ Registrar broadcast en rate limiting (después de ejecución exitosa)
      broadcastRateLimit.recordBroadcast(interaction.user.id);

      collector.stop();
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('⏰ Tiempo Agotado')
          .setDescription('La sesión de broadcast expiró. Ejecuta el comando nuevamente si deseas enviar el anuncio.')
          .setColor('#FF5733')
          .setTimestamp();

        try {
          await interaction.editReply({
            embeds: [timeoutEmbed],
            components: []
          });
        } catch (error) {
          console.error('Error updating expired broadcast:', error);
        }
      }
    });

    // 📝 Log de seguridad
    console.log(`🔐 [BROADCAST] ${interaction.user.tag} (${interaction.user.id}) creó un anuncio: "${titulo}"`);
  },
};

// 🔍 Función para validar URLs de imagen
function validateImageUrl(url) {
  if (!url) return { valid: true };

  // Verificar formato de URL
  try {
    new URL(url);
  } catch (error) {
    return { valid: false, error: 'URL inválida' };
  }

  // Verificar extensión de archivo
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );

  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: 'Solo se permiten imágenes .png, .jpg, .jpeg o .gif' 
    };
  }

  return { valid: true };
}

// 🎯 Función para encontrar el mejor canal en un servidor
function findBestChannel(guild) {
  const botMember = guild.members.me;
  if (!botMember) return null;

  // Filtrar canales donde el bot puede escribir
  const availableChannels = guild.channels.cache.filter(channel => 
    channel.type === 0 && // GuildText
    channel.permissionsFor(botMember).has(['SendMessages', 'ViewChannel', 'EmbedLinks'])
  );

  if (availableChannels.size === 0) return null;

  // Prioridad de nombres de canales
  const priorities = [
    'anuncios', 'announcements', 'noticias', 'news',
    'general', 'chat', 'principal', 'main',
    'bienvenidas', 'welcome', 'reglas', 'rules'
  ];

  // Buscar canal por prioridad
  for (const priority of priorities) {
    const channel = availableChannels.find(ch => 
      ch.name.toLowerCase().includes(priority)
    );
    if (channel) return channel;
  }

  // Si no encuentra uno específico, usar el primer canal disponible
  return availableChannels.first();
}

// 🚀 Función principal para ejecutar el broadcast
async function executeBroadcast(targetGuilds, announceEmbed, client, interaction, audienceType, user, broadcastData) {
  let successCount = 0;
  let failCount = 0;
  const results = [];
  const serverResults = [];
  const startTime = Date.now();

  for (let i = 0; i < targetGuilds.length; i++) {
    const guild = targetGuilds[i];
    
    try {
      const targetChannel = findBestChannel(guild);
      
      if (!targetChannel) {
        failCount++;
        results.push(`❌ ${guild.name}: Sin canal disponible`);
        serverResults.push({
          guildId: guild.id,
          guildName: guild.name,
          channelId: null,
          channelName: null,
          status: 'no_channel',
          error: 'No se encontró un canal disponible'
        });
        continue;
      }

      // Enviar el anuncio
      await targetChannel.send({ embeds: [announceEmbed] });
      successCount++;
      results.push(`✅ ${guild.name}: Enviado en #${targetChannel.name}`);
      serverResults.push({
        guildId: guild.id,
        guildName: guild.name,
        channelId: targetChannel.id,
        channelName: targetChannel.name,
        status: 'success',
        error: null
      });

      // 📊 Actualizar progreso cada 10 servidores
      if ((i + 1) % 10 === 0 || i === targetGuilds.length - 1) {
        const progress = Math.round(((i + 1) / targetGuilds.length) * 100);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        
        const progressEmbed = new EmbedBuilder()
          .setTitle('📡 Broadcast en Progreso...')
          .setDescription(
            `**🎯 Público objetivo:** ${audienceType}\n` +
            `**📊 Progreso:** ${i + 1}/${targetGuilds.length} (${progress}%)\n` +
            `**✅ Exitosos:** ${successCount}\n` +
            `**❌ Fallidos:** ${failCount}\n` +
            `**⏱️ Tiempo transcurrido:** ${elapsed}s`
          )
          .setColor('#00FF00')
          .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed] });
      }

    } catch (error) {
      failCount++;
      const errorMsg = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
      results.push(`❌ ${guild.name}: ${errorMsg}`);
      serverResults.push({
        guildId: guild.id,
        guildName: guild.name,
        channelId: null,
        channelName: null,
        status: 'failed',
        error: error.message
      });
      console.error(`Error sending to ${guild.name}:`, error);
    }

    // ⏱️ Delay para evitar rate limits (1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // 📊 Calcular estadísticas finales
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const successRate = Math.round((successCount / targetGuilds.length) * 100);

  // 💾 Guardar log en la base de datos
  try {
    const broadcastLog = new BroadcastLog({
      title: broadcastData.titulo,
      description: broadcastData.descripcion,
      imageUrl: broadcastData.imagenUrl,
      thumbnailUrl: broadcastData.thumbnailUrl,
      color: broadcastData.color,
      executorId: user.id,
      executorTag: user.tag,
      audienceType: getAudienceTypeCode(audienceType),
      audienceDescription: audienceType,
      targetServers: targetGuilds.length,
      successfulSends: successCount,
      failedSends: failCount,
      successRate: successRate,
      executionTime: totalTime,
      serverResults: serverResults,
      executedAt: new Date()
    });

    await broadcastLog.save();
    console.log(`💾 [BROADCAST] Log guardado para broadcast de ${user.tag}: ${broadcastData.titulo}`);
  } catch (logError) {
    console.error('Error guardando broadcast log:', logError);
  }

  // 📊 Reporte final
  const finalEmbed = new EmbedBuilder()
    .setTitle('📤 Broadcast Completado')
    .setDescription(
      `**🎯 Público objetivo:** ${audienceType}\n` +
      `**📊 Resultados:**\n` +
      `✅ **Exitosos:** ${successCount}\n` +
      `❌ **Fallidos:** ${failCount}\n` +
      `📈 **Tasa de éxito:** ${successRate}%\n` +
      `⏱️ **Tiempo total:** ${totalTime}s\n\n` +
      `💾 **Log guardado en la base de datos**`
    )
    .setColor(successCount > failCount ? '#00FF00' : '#FF5733')
    .setTimestamp()
    .setFooter({ text: 'Broadcast completado exitosamente' });

  // Agregar algunos detalles de errores si los hay
  if (failCount > 0) {
    const errorSample = results
      .filter(r => r.startsWith('❌'))
      .slice(0, 5)
      .join('\n');
    
    if (errorSample) {
      finalEmbed.addFields({
        name: '🔍 Muestra de Errores',
        value: errorSample.substring(0, 1024),
        inline: false
      });
    }
  }

  await interaction.editReply({ embeds: [finalEmbed] });

  // 📝 Log completo
  console.log(`📊 [BROADCAST] Completado - ${successCount}/${targetGuilds.length} exitosos en ${totalTime}s`);
}

// 🔢 Función auxiliar para convertir tipo de audiencia
function getAudienceTypeCode(audienceDescription) {
  return 'all'; // Solo tenemos la opción de todos los servidores
}
