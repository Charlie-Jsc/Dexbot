// 📝 Handler para interacciones de modales
module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // 🔍 Verificar si es una interacción de modal
    if (!interaction.isModalSubmit()) return;

    try {
      // 📢 Manejar modal de broadcast
      if (interaction.customId === 'broadcast_modal') {
        const broadcastCommand = require('../commands/owner/broadcast');
        if (broadcastCommand.handleModalSubmit) {
          await broadcastCommand.handleModalSubmit(interaction);
        }
        return;
      }

      // Aquí se pueden agregar más handlers de modales en el futuro
      console.log(`⚠️ Modal no reconocido: ${interaction.customId}`);
    } catch (error) {
      console.error('❌ Error manejando modal:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Hubo un error procesando el modal. Inténtalo nuevamente.',
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          content: '❌ Hubo un error procesando el modal. Inténtalo nuevamente.',
        });
      }
    }
  },
};
