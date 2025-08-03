const { Schema, model } = require('mongoose');

const broadcastLogSchema = new Schema({
  // 📋 Información del broadcast
  title: {
    type: String,
    required: true,
    maxlength: 256
  },
  description: {
    type: String,
    required: true,
    maxlength: 4000
  },
  imageUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#00BFFF'
  },

  // 👤 Información del ejecutor
  executorId: {
    type: String,
    required: true
  },
  executorTag: {
    type: String,
    required: true
  },

  // 🎯 Información de la audiencia
  audienceType: {
    type: String,
    required: true,
    enum: ['all', 'online', 'offline']
  },
  audienceDescription: {
    type: String,
    required: true
  },

  // 📊 Estadísticas del broadcast
  targetServers: {
    type: Number,
    required: true
  },
  successfulSends: {
    type: Number,
    required: true
  },
  failedSends: {
    type: Number,
    required: true
  },
  successRate: {
    type: Number,
    required: true
  },
  executionTime: {
    type: Number, // en segundos
    required: true
  },

  // 📝 Detalles específicos
  serverResults: [{
    guildId: String,
    guildName: String,
    channelId: String,
    channelName: String,
    status: {
      type: String,
      enum: ['success', 'failed', 'no_channel']
    },
    error: String
  }],

  // ⏱️ Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  executedAt: {
    type: Date,
    required: true
  }
});

// 📊 Índices para optimizar consultas
broadcastLogSchema.index({ executorId: 1, createdAt: -1 });
broadcastLogSchema.index({ audienceType: 1 });
broadcastLogSchema.index({ executedAt: -1 });

// 🔍 Método estático para obtener estadísticas
broadcastLogSchema.statics.getBroadcastStats = async function(period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  return await this.aggregate([
    { $match: { executedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalBroadcasts: { $sum: 1 },
        totalServersReached: { $sum: '$successfulSends' },
        totalServersFailed: { $sum: '$failedSends' },
        avgSuccessRate: { $avg: '$successRate' },
        avgExecutionTime: { $avg: '$executionTime' },
        byAudience: {
          $push: {
            type: '$audienceType',
            success: '$successfulSends',
            failed: '$failedSends'
          }
        }
      }
    }
  ]);
};

// 🔍 Método estático para obtener historial de usuario
broadcastLogSchema.statics.getUserHistory = async function(userId, limit = 10) {
  return await this.find({ executorId: userId })
    .sort({ executedAt: -1 })
    .limit(limit)
    .select('title audienceDescription successfulSends failedSends successRate executedAt');
};

module.exports = model('BroadcastLog', broadcastLogSchema);
