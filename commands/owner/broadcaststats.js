const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  PermissionFlagsBits 
} = require('discord.js');
const BroadcastLog = require('../../models/BroadcastLog');
const broadcastRateLimit = require('../../utils/broadcastRateLimit');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcaststats')
    .setDescription('Ver estadísticas y historial del sistema de broadcast')
    .addSubcommand(subcommand =>
      subcommand
        .setName('general')
        .setDescription('Estadísticas generales del sistema')
        .addIntegerOption(option =>
          option
            .setName('dias')
            .setDescription('Número de días para el análisis (por defecto: 30)')
            .setMinValue(1)
            .setMaxValue(365)
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('historial')
        .setDescription('Historial de broadcasts del usuario')
        .addUserOption(option =>
          option
            .setName('usuario')
            .setDescription('Usuario específico (solo para propietarios)')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option
            .setName('limite')
            .setDescription('Número de broadcasts a mostrar (por defecto: 10)')
            .setMinValue(1)
            .setMaxValue(50)
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('detalle')
        .setDescription('Detalles de un broadcast específico (solo propietarios)')
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('ID del broadcast log')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('limits')
        .setDescription('Ver límites de uso y estadísticas del rate limiting')
        .addUserOption(option =>
          option
            .setName('usuario')
            .setDescription('Usuario específico (solo para propietarios)')
            .setRequired(false)
        )
    ),
    // 🔒 Sin permisos predeterminados - manejo interno de seguridad

  async execute(interaction) {
    // 🛡️ Verificación de seguridad básica
    const botOwners = process.env.BOT_OWNERS ? 
      process.env.BOT_OWNERS.split(',').map(id => id.trim()) : 
      [];
    
    const isOwner = botOwners.includes(interaction.user.id);
    const subcommand = interaction.options.getSubcommand();

    // 🔒 Verificar permisos para comandos específicos
    if ((subcommand === 'detalle' || 
         (subcommand === 'historial' && interaction.options.getUser('usuario')) ||
         (subcommand === 'limits' && interaction.options.getUser('usuario'))) && 
        !isOwner) {
      const accessDeniedEmbed = new EmbedBuilder()
        .setTitle('🔒 Acceso Denegado')
        .setDescription('Solo los propietarios del bot pueden usar esta función.')
        .setColor('#FF0000')
        .setTimestamp();

      return interaction.reply({
        embeds: [accessDeniedEmbed],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      switch (subcommand) {
        case 'general':
          await handleGeneralStats(interaction);
          break;
        case 'historial':
          await handleHistory(interaction, isOwner);
          break;
        case 'detalle':
          await handleDetail(interaction);
          break;
        case 'limits':
          await handleLimits(interaction, isOwner);
          break;
      }
    } catch (error) {
      console.error('Error en broadcaststats:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Ocurrió un error al obtener las estadísticas.')
        .setColor('#FF0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

// 📊 Función para manejar estadísticas generales
async function handleGeneralStats(interaction) {
  const days = interaction.options.getInteger('dias') || 30;
  
  try {
    const stats = await BroadcastLog.getBroadcastStats(days);
    
    if (!stats || stats.length === 0) {
      const noDataEmbed = new EmbedBuilder()
        .setTitle('📊 Estadísticas de Broadcast')
        .setDescription(`No hay datos de broadcasts en los últimos ${days} días.`)
        .setColor('#FFA500')
        .setTimestamp();

      return interaction.editReply({ embeds: [noDataEmbed] });
    }

    const data = stats[0];
    
    // 📈 Procesar datos por tipo de audiencia
    const audienceStats = {};
    data.byAudience.forEach(item => {
      if (!audienceStats[item.type]) {
        audienceStats[item.type] = { success: 0, failed: 0, total: 0 };
      }
      audienceStats[item.type].success += item.success;
      audienceStats[item.type].failed += item.failed;
      audienceStats[item.type].total += 1;
    });

    // 🎨 Crear embed principal
    const statsEmbed = new EmbedBuilder()
      .setTitle('📊 Estadísticas de Broadcast')
      .setDescription(`Análisis de los últimos ${days} días`)
      .setColor('#00BFFF')
      .setTimestamp()
      .setFooter({ text: 'Sistema de Broadcast - Dexbot' });

    // 📈 Estadísticas generales
    statsEmbed.addFields(
      {
        name: '📤 Broadcasts Totales',
        value: `${data.totalBroadcasts.toLocaleString()}`,
        inline: true
      },
      {
        name: '✅ Servidores Alcanzados',
        value: `${data.totalServersReached.toLocaleString()}`,
        inline: true
      },
      {
        name: '❌ Envíos Fallidos',
        value: `${data.totalServersFailed.toLocaleString()}`,
        inline: true
      },
      {
        name: '📈 Tasa de Éxito Promedio',
        value: `${Math.round(data.avgSuccessRate)}%`,
        inline: true
      },
      {
        name: '⏱️ Tiempo Promedio',
        value: `${Math.round(data.avgExecutionTime)}s`,
        inline: true
      },
      {
        name: '🎯 Eficiencia',
        value: `${Math.round((data.totalServersReached / (data.totalServersReached + data.totalServersFailed)) * 100)}%`,
        inline: true
      }
    );

    // 📊 Desglose por tipo de audiencia
    let audienceBreakdown = '';
    const typeNames = {
      'all': 'Todos los Servidores',
      'online': 'Usuarios Online',
      'offline': 'Usuarios Offline'
    };

    for (const [type, stats] of Object.entries(audienceStats)) {
      const successRate = Math.round((stats.success / (stats.success + stats.failed)) * 100);
      audienceBreakdown += `${typeNames[type] || type}\n`;
      audienceBreakdown += `├ Broadcasts: ${stats.total}\n`;
      audienceBreakdown += `├ Exitosos: ${stats.success.toLocaleString()}\n`;
      audienceBreakdown += `└ Tasa: ${successRate}%\n\n`;
    }

    if (audienceBreakdown) {
      statsEmbed.addFields({
        name: '🎯 Por Tipo de Audiencia',
        value: audienceBreakdown.substring(0, 1024),
        inline: false
      });
    }

    await interaction.editReply({ embeds: [statsEmbed] });

  } catch (error) {
    console.error('Error getting general stats:', error);
    throw error;
  }
}

// 📋 Función para manejar historial
async function handleHistory(interaction, isOwner) {
  const targetUser = interaction.options.getUser('usuario');
  const limit = interaction.options.getInteger('limite') || 10;
  
  const userId = targetUser ? targetUser.id : interaction.user.id;
  const userTag = targetUser ? targetUser.tag : interaction.user.tag;

  try {
    const history = await BroadcastLog.getUserHistory(userId, limit);
    
    if (!history || history.length === 0) {
      const noHistoryEmbed = new EmbedBuilder()
        .setTitle('📋 Historial de Broadcasts')
        .setDescription(`${targetUser ? userTag : 'No tienes'} no tiene broadcasts registrados.`)
        .setColor('#FFA500')
        .setTimestamp();

      return interaction.editReply({ embeds: [noHistoryEmbed] });
    }

    const historyEmbed = new EmbedBuilder()
      .setTitle('📋 Historial de Broadcasts')
      .setDescription(`Últimos ${history.length} broadcasts de **${userTag}**`)
      .setColor('#00BFFF')
      .setTimestamp()
      .setFooter({ text: `Mostrando ${history.length} de ${limit} resultados` });

    // 📝 Formatear cada broadcast
    history.forEach((broadcast, index) => {
      const date = new Date(broadcast.executedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const successRate = broadcast.successRate;
      const statusIcon = successRate >= 90 ? '🟢' : successRate >= 70 ? '🟡' : '🔴';

      historyEmbed.addFields({
        name: `${statusIcon} ${broadcast.title}`,
        value: 
          `**Audiencia:** ${broadcast.audienceDescription}\n` +
          `**Resultados:** ${broadcast.successfulSends}✅ / ${broadcast.failedSends}❌ (${successRate}%)\n` +
          `**Fecha:** ${date}`,
        inline: true
      });
    });

    // 🔍 Botón para más detalles (solo para propietarios)
    const components = [];
    if (isOwner && history.length > 0) {
      const detailButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('broadcast_detail_select')
            .setLabel('🔍 Ver Detalles')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📊')
        );
      components.push(detailButton);
    }

    await interaction.editReply({ 
      embeds: [historyEmbed],
      components: components
    });

  } catch (error) {
    console.error('Error getting history:', error);
    throw error;
  }
}

// 🔍 Función para manejar detalles específicos
async function handleDetail(interaction) {
  const logId = interaction.options.getString('id');
  
  try {
    const broadcastLog = await BroadcastLog.findById(logId);
    
    if (!broadcastLog) {
      const notFoundEmbed = new EmbedBuilder()
        .setTitle('❌ No Encontrado')
        .setDescription('No se encontró un broadcast con ese ID.')
        .setColor('#FF0000')
        .setTimestamp();

      return interaction.editReply({ embeds: [notFoundEmbed] });
    }

    // 🎨 Crear embed de detalles
    const detailEmbed = new EmbedBuilder()
      .setTitle('🔍 Detalles del Broadcast')
      .setDescription(`**"${broadcastLog.title}"**`)
      .setColor(broadcastLog.color || '#00BFFF')
      .setTimestamp(broadcastLog.executedAt)
      .setFooter({ text: `ID: ${broadcastLog._id}` });

    // 📊 Información básica
    detailEmbed.addFields(
      {
        name: '👤 Ejecutor',
        value: `${broadcastLog.executorTag}\n\`${broadcastLog.executorId}\``,
        inline: true
      },
      {
        name: '🎯 Audiencia',
        value: broadcastLog.audienceDescription,
        inline: true
      },
      {
        name: '📊 Resultados',
        value: 
          `Objetivo: ${broadcastLog.targetServers}\n` +
          `Exitosos: ${broadcastLog.successfulSends}\n` +
          `Fallidos: ${broadcastLog.failedSends}\n` +
          `Tasa: ${broadcastLog.successRate}%`,
        inline: true
      }
    );

    // 📝 Contenido del mensaje
    detailEmbed.addFields({
      name: '📝 Contenido',
      value: broadcastLog.description.substring(0, 1024),
      inline: false
    });

    // 🖼️ Imágenes
    if (broadcastLog.imageUrl || broadcastLog.thumbnailUrl) {
      let imageInfo = '';
      if (broadcastLog.imageUrl) imageInfo += `**Imagen:** [Ver imagen](${broadcastLog.imageUrl})\n`;
      if (broadcastLog.thumbnailUrl) imageInfo += `**Miniatura:** [Ver miniatura](${broadcastLog.thumbnailUrl})\n`;
      
      detailEmbed.addFields({
        name: '🖼️ Multimedia',
        value: imageInfo,
        inline: false
      });
    }

    // ⏱️ Información de tiempo
    const executionDate = new Date(broadcastLog.executedAt).toLocaleString('es-ES');
    detailEmbed.addFields({
      name: '⏱️ Ejecución',
      value: 
        `**Fecha:** ${executionDate}\n` +
        `**Duración:** ${broadcastLog.executionTime}s`,
      inline: true
    });

    await interaction.editReply({ embeds: [detailEmbed] });

  } catch (error) {
    console.error('Error getting broadcast detail:', error);
    throw error;
  }
}

// 🚦 Función para manejar estadísticas de rate limiting
async function handleLimits(interaction, isOwner) {
  const targetUser = interaction.options.getUser('usuario');
  const userId = targetUser ? targetUser.id : interaction.user.id;
  const userTag = targetUser ? targetUser.tag : interaction.user.tag;
  
  try {
    // 📊 Obtener estadísticas de uso
    const usageStats = broadcastRateLimit.getUsageStats(userId);
    const isUserOwner = broadcastRateLimit.isOwner(userId);
    
    // 🎨 Crear embed principal
    const limitsEmbed = new EmbedBuilder()
      .setTitle('🚦 Límites de Broadcast')
      .setDescription(`Estadísticas de uso para **${userTag}**`)
      .setColor(isUserOwner ? '#FFD700' : '#00BFFF')
      .setTimestamp()
      .setFooter({ text: 'Sistema de Rate Limiting - Dexbot' });

    // 🔒 Información de permisos
    if (isUserOwner) {
      limitsEmbed.addFields({
        name: '👑 Estado de Usuario',
        value: '**PROPIETARIO** - Sin límites de uso',
        inline: false
      });
    } else {
      limitsEmbed.addFields({
        name: '👤 Estado de Usuario',
        value: 'Usuario estándar - Sujeto a límites',
        inline: false
      });
    }

    // 📊 Estadísticas del usuario
    if (usageStats.user && !isUserOwner) {
      const cooldownMinutes = Math.ceil(usageStats.user.cooldownRemaining / 1000 / 60);
      const nextBroadcastTime = cooldownMinutes > 0 ? 
        `En ${cooldownMinutes} minutos` : 
        'Disponible ahora';

      limitsEmbed.addFields(
        {
          name: '📊 Uso por Hora',
          value: `${usageStats.user.hourly}/${usageStats.user.maxHourly}`,
          inline: true
        },
        {
          name: '📅 Uso por Día',
          value: `${usageStats.user.daily}/${usageStats.user.maxDaily}`,
          inline: true
        },
        {
          name: '⏱️ Próximo Broadcast',
          value: nextBroadcastTime,
          inline: true
        }
      );

      // 📈 Barra de progreso visual
      const hourlyProgress = createProgressBar(usageStats.user.hourly, usageStats.user.maxHourly);
      const dailyProgress = createProgressBar(usageStats.user.daily, usageStats.user.maxDaily);
      
      limitsEmbed.addFields({
        name: '📈 Progreso Visual',
        value: 
          `**Horario:** ${hourlyProgress}\n` +
          `**Diario:** ${dailyProgress}`,
        inline: false
      });
    }

    // 🌐 Estadísticas globales
    if (isOwner || !targetUser) {
      const globalProgress = {
        hourly: createProgressBar(usageStats.global.hourly, usageStats.global.maxHourly),
        daily: createProgressBar(usageStats.global.daily, usageStats.global.maxDaily)
      };

      limitsEmbed.addFields({
        name: '🌐 Uso Global del Sistema',
        value: 
          `**Por hora:** ${usageStats.global.hourly}/${usageStats.global.maxHourly}\n` +
          `${globalProgress.hourly}\n` +
          `**Por día:** ${usageStats.global.daily}/${usageStats.global.maxDaily}\n` +
          `${globalProgress.daily}`,
        inline: false
      });
    }

    // 📋 Información de límites
    if (!isUserOwner) {
      limitsEmbed.addFields({
        name: '📋 Límites del Sistema',
        value: 
          `🔹 **Cooldown entre broadcasts:** 5 minutos\n` +
          `🔹 **Máximo por hora:** 3 broadcasts\n` +
          `🔹 **Máximo por día:** 10 broadcasts\n` +
          `🔹 **Límite global horario:** 20 broadcasts\n` +
          `🔹 **Límite global diario:** 50 broadcasts`,
        inline: false
      });
    }

    await interaction.editReply({ embeds: [limitsEmbed] });

  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    throw error;
  }
}

// 📊 Función auxiliar para crear barras de progreso
function createProgressBar(current, max, length = 10) {
  const percentage = Math.min(current / max, 1);
  const filledLength = Math.round(length * percentage);
  const emptyLength = length - filledLength;
  
  const filledChar = '█';
  const emptyChar = '░';
  
  const bar = filledChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
  const percent = Math.round(percentage * 100);
  
  return `${bar} ${percent}%`;
}
