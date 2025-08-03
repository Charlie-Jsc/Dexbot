const { Events, MessageFlags } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.commands.get(interaction.commandName);
      
      // 🔒 Si no se encuentra en comandos normales, buscar en comandos de propietario
      if (!command) {
        command = interaction.client.ownerCommands?.get(interaction.commandName);
        
        if (command) {
          // Verificar que solo los propietarios puedan usar estos comandos
          const botOwners = process.env.BOT_OWNERS ? 
            process.env.BOT_OWNERS.split(',').map(id => id.trim()) : 
            [];
          
          if (!botOwners.includes(interaction.user.id)) {
            // Respuesta que simula que el comando no existe
            return interaction.reply({
              content: '❌ La aplicación no respondió a la interacción.',
              flags: [MessageFlags.Ephemeral],
            });
          }
        }
      }
      
      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            flags: [MessageFlags.Ephemeral],
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            flags: [MessageFlags.Ephemeral],
          });
        }
      }
    }

    if (interaction.isAutocomplete()) {
      let command = interaction.client.commands.get(interaction.commandName);
      
      // 🔒 Buscar también en comandos de propietario para autocompletado
      if (!command) {
        command = interaction.client.ownerCommands?.get(interaction.commandName);
      }
      
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
          await interaction.respond([]);
        }
      }
    }

    // 📝 Manejar interacciones de modales
    if (interaction.isModalSubmit()) {
      try {
        // 📢 Manejar modal de broadcast
        if (interaction.customId === 'broadcast_modal') {
          const broadcastCommand = require('../../commands/owner/broadcast');
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
            flags: [MessageFlags.Ephemeral],
          });
        } else {
          await interaction.editReply({
            content: '❌ Hubo un error procesando el modal. Inténtalo nuevamente.',
          });
        }
      }
    }
  },
};
