const rateLimits = new Map();

/**
 * 🛡️ Sistema de Rate Limiting para Broadcasts
 * Previene spam y uso abusivo del sistema de anuncios
 */
class BroadcastRateLimit {
  constructor() {
    this.limits = {
      // Límites por usuario
      USER_HOURLY: { max: 3, window: 60 * 60 * 1000 }, // 3 por hora
      USER_DAILY: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 por día
      
      // Límites globales del sistema
      GLOBAL_HOURLY: { max: 20, window: 60 * 60 * 1000 }, // 20 por hora total
      GLOBAL_DAILY: { max: 50, window: 24 * 60 * 60 * 1000 }, // 50 por día total
      
      // Cooldown entre broadcasts del mismo usuario
      USER_COOLDOWN: { window: 5 * 60 * 1000 } // 5 minutos entre broadcasts
    };
  }

  /**
   * 🔍 Verificar si un usuario puede ejecutar un broadcast
   * @param {string} userId - ID del usuario
   * @returns {Object} - Resultado de la verificación
   */
  checkUserLimit(userId) {
    const now = Date.now();
    
    // 🔄 Limpiar registros expirados
    this.cleanExpiredRecords();
    
    // 📊 Obtener registros del usuario
    const userKey = `user_${userId}`;
    const userRecords = rateLimits.get(userKey) || { hourly: [], daily: [], lastBroadcast: 0 };
    
    // ⏱️ Verificar cooldown
    const timeSinceLastBroadcast = now - userRecords.lastBroadcast;
    if (timeSinceLastBroadcast < this.limits.USER_COOLDOWN.window) {
      const remainingTime = Math.ceil((this.limits.USER_COOLDOWN.window - timeSinceLastBroadcast) / 1000 / 60);
      return {
        allowed: false,
        reason: 'COOLDOWN',
        message: `⏱️ Debes esperar ${remainingTime} minutos entre broadcasts.`,
        retryAfter: remainingTime * 60
      };
    }
    
    // 📊 Verificar límite horario del usuario
    const hourlyCount = userRecords.hourly.filter(
      timestamp => now - timestamp < this.limits.USER_HOURLY.window
    ).length;
    
    if (hourlyCount >= this.limits.USER_HOURLY.max) {
      const oldestRecord = Math.min(...userRecords.hourly);
      const resetTime = Math.ceil((this.limits.USER_HOURLY.window - (now - oldestRecord)) / 1000 / 60);
      return {
        allowed: false,
        reason: 'USER_HOURLY',
        message: `📊 Has alcanzado el límite de ${this.limits.USER_HOURLY.max} broadcasts por hora. Reinicia en ${resetTime} minutos.`,
        retryAfter: resetTime * 60
      };
    }
    
    // 📊 Verificar límite diario del usuario
    const dailyCount = userRecords.daily.filter(
      timestamp => now - timestamp < this.limits.USER_DAILY.window
    ).length;
    
    if (dailyCount >= this.limits.USER_DAILY.max) {
      return {
        allowed: false,
        reason: 'USER_DAILY',
        message: `📅 Has alcanzado el límite de ${this.limits.USER_DAILY.max} broadcasts por día. Reinicia mañana.`,
        retryAfter: 24 * 60 * 60
      };
    }
    
    // 🌐 Verificar límites globales
    const globalCheck = this.checkGlobalLimit();
    if (!globalCheck.allowed) {
      return globalCheck;
    }
    
    return { allowed: true };
  }

  /**
   * 🌐 Verificar límites globales del sistema
   * @returns {Object} - Resultado de la verificación global
   */
  checkGlobalLimit() {
    const now = Date.now();
    const globalRecords = rateLimits.get('global') || { hourly: [], daily: [] };
    
    // 📊 Verificar límite horario global
    const globalHourlyCount = globalRecords.hourly.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_HOURLY.window
    ).length;
    
    if (globalHourlyCount >= this.limits.GLOBAL_HOURLY.max) {
      return {
        allowed: false,
        reason: 'GLOBAL_HOURLY',
        message: `🌐 El sistema ha alcanzado el límite de ${this.limits.GLOBAL_HOURLY.max} broadcasts por hora. Intenta más tarde.`,
        retryAfter: 60 * 60
      };
    }
    
    // 📊 Verificar límite diario global
    const globalDailyCount = globalRecords.daily.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_DAILY.window
    ).length;
    
    if (globalDailyCount >= this.limits.GLOBAL_DAILY.max) {
      return {
        allowed: false,
        reason: 'GLOBAL_DAILY',
        message: `🌐 El sistema ha alcanzado el límite de ${this.limits.GLOBAL_DAILY.max} broadcasts por día.`,
        retryAfter: 24 * 60 * 60
      };
    }
    
    return { allowed: true };
  }

  /**
   * ✅ Registrar un broadcast exitoso
   * @param {string} userId - ID del usuario
   */
  recordBroadcast(userId) {
    const now = Date.now();
    
    // 📝 Registrar para el usuario
    const userKey = `user_${userId}`;
    const userRecords = rateLimits.get(userKey) || { hourly: [], daily: [], lastBroadcast: 0 };
    
    userRecords.hourly.push(now);
    userRecords.daily.push(now);
    userRecords.lastBroadcast = now;
    
    // 🧹 Limpiar registros antiguos del usuario
    userRecords.hourly = userRecords.hourly.filter(
      timestamp => now - timestamp < this.limits.USER_HOURLY.window
    );
    userRecords.daily = userRecords.daily.filter(
      timestamp => now - timestamp < this.limits.USER_DAILY.window
    );
    
    rateLimits.set(userKey, userRecords);
    
    // 📝 Registrar globalmente
    const globalRecords = rateLimits.get('global') || { hourly: [], daily: [] };
    globalRecords.hourly.push(now);
    globalRecords.daily.push(now);
    
    // 🧹 Limpiar registros antiguos globales
    globalRecords.hourly = globalRecords.hourly.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_HOURLY.window
    );
    globalRecords.daily = globalRecords.daily.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_DAILY.window
    );
    
    rateLimits.set('global', globalRecords);
    
    console.log(`📊 [RATE_LIMIT] Broadcast registrado para usuario ${userId}`);
  }

  /**
   * 📊 Obtener estadísticas de uso actual
   * @param {string} userId - ID del usuario (opcional)
   * @returns {Object} - Estadísticas actuales
   */
  getUsageStats(userId = null) {
    const now = Date.now();
    this.cleanExpiredRecords();
    
    const stats = {
      global: {
        hourly: 0,
        daily: 0,
        maxHourly: this.limits.GLOBAL_HOURLY.max,
        maxDaily: this.limits.GLOBAL_DAILY.max
      }
    };
    
    // 📊 Estadísticas globales
    const globalRecords = rateLimits.get('global') || { hourly: [], daily: [] };
    stats.global.hourly = globalRecords.hourly.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_HOURLY.window
    ).length;
    stats.global.daily = globalRecords.daily.filter(
      timestamp => now - timestamp < this.limits.GLOBAL_DAILY.window
    ).length;
    
    // 📊 Estadísticas del usuario específico
    if (userId) {
      const userKey = `user_${userId}`;
      const userRecords = rateLimits.get(userKey) || { hourly: [], daily: [], lastBroadcast: 0 };
      
      stats.user = {
        hourly: userRecords.hourly.filter(
          timestamp => now - timestamp < this.limits.USER_HOURLY.window
        ).length,
        daily: userRecords.daily.filter(
          timestamp => now - timestamp < this.limits.USER_DAILY.window
        ).length,
        maxHourly: this.limits.USER_HOURLY.max,
        maxDaily: this.limits.USER_DAILY.max,
        lastBroadcast: userRecords.lastBroadcast,
        cooldownRemaining: Math.max(0, this.limits.USER_COOLDOWN.window - (now - userRecords.lastBroadcast))
      };
    }
    
    return stats;
  }

  /**
   * 🧹 Limpiar registros expirados para optimizar memoria
   */
  cleanExpiredRecords() {
    const now = Date.now();
    const maxWindow = Math.max(
      this.limits.USER_DAILY.window,
      this.limits.GLOBAL_DAILY.window
    );
    
    for (const [key, records] of rateLimits.entries()) {
      if (key === 'global') {
        // Limpiar registros globales
        if (records.hourly) {
          records.hourly = records.hourly.filter(
            timestamp => now - timestamp < this.limits.GLOBAL_HOURLY.window
          );
        }
        if (records.daily) {
          records.daily = records.daily.filter(
            timestamp => now - timestamp < this.limits.GLOBAL_DAILY.window
          );
        }
      } else if (key.startsWith('user_')) {
        // Limpiar registros de usuario
        if (records.hourly) {
          records.hourly = records.hourly.filter(
            timestamp => now - timestamp < this.limits.USER_HOURLY.window
          );
        }
        if (records.daily) {
          records.daily = records.daily.filter(
            timestamp => now - timestamp < this.limits.USER_DAILY.window
          );
        }
        
        // Eliminar usuario si no tiene registros recientes
        if ((!records.hourly || records.hourly.length === 0) &&
            (!records.daily || records.daily.length === 0) &&
            now - records.lastBroadcast > maxWindow) {
          rateLimits.delete(key);
        }
      }
    }
  }

  /**
   * 🔒 Verificar si un usuario es propietario (sin límites)
   * @param {string} userId - ID del usuario
   * @returns {boolean} - Es propietario o no
   */
  isOwner(userId) {
    const botOwners = process.env.BOT_OWNERS ? 
      process.env.BOT_OWNERS.split(',').map(id => id.trim()) : 
      [];
    return botOwners.includes(userId);
  }

  /**
   * 🚀 Verificación completa antes de broadcast
   * @param {string} userId - ID del usuario
   * @returns {Object} - Resultado completo de verificación
   */
  verifyBroadcastPermission(userId) {
    // 🔒 Los propietarios no tienen límites
    if (this.isOwner(userId)) {
      return { 
        allowed: true, 
        reason: 'OWNER',
        message: '🔒 Usuario propietario - Sin límites'
      };
    }
    
    return this.checkUserLimit(userId);
  }
}

// 🏭 Exportar instancia singleton
const broadcastRateLimit = new BroadcastRateLimit();

// 🧹 Limpiar registros cada 30 minutos
setInterval(() => {
  broadcastRateLimit.cleanExpiredRecords();
  console.log('🧹 [RATE_LIMIT] Registros expirados limpiados');
}, 30 * 60 * 1000);

module.exports = broadcastRateLimit;
