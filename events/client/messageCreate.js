const { Events, EmbedBuilder } = require('discord.js');
const UserPrefix = require('../../models/UserPrefix');
const { parseMessageArgs, createFakeInteraction } = require('../../utils/prefixUtils');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    const mention = new RegExp(`^<@!?${message.client.user.id}>( |)$`);

    // Manejar menciones del bot
    if (message.content.match(mention)) {
      try {
        const commands = await message.client.application.commands.fetch();

        const helpCommand = commands.find((cmd) => cmd.name === 'help');
        const helpCommandId = helpCommand ? helpCommand.id : 'unknown';

        const mentionEmbed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setDescription(
            `Hey ${message.author}, I'm Dexbot, I use \`/\` commands.\nCheck out my commands, type </help:${helpCommandId}>\n\n💡 **Tip:** You can set a custom prefix with \`/prefix set\``
          )
          .setTimestamp();

        message.reply({ embeds: [mentionEmbed] }).catch(console.error);
      } catch (error) {
        console.error('Error fetching commands:', error);
      }
      return;
    }

    // Manejar comandos con prefix personalizado
    try {
      // Obtener el prefix personalizado del usuario
      const userPrefix = await UserPrefix.findOne({ userId: message.author.id });
      const customPrefix = userPrefix ? userPrefix.prefix : null;

      if (!customPrefix) return; // Si no tiene prefix personalizado, no procesar

      // Verificar si el mensaje comienza con el prefix personalizado
      if (!message.content.startsWith(customPrefix)) return;

      // Extraer el comando y argumentos
      const args = message.content.slice(customPrefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (!commandName) return;

      // Buscar el comando en la colección de comandos del cliente
      const command = message.client.commands.get(commandName);

      if (!command) {
        // Comando no encontrado - mostrar sugerencia amigable
        const notFoundEmbed = new EmbedBuilder()
          .setColor('#FF5733')
          .setTitle('❌ Comando No Encontrado')
          .setDescription(
            `El comando \`${customPrefix}${commandName}\` no existe.\n\n` +
            `**💡 Sugerencias:**\n` +
            `• Usa \`${customPrefix}help\` para ver todos los comandos disponibles\n` +
            `• Verifica que escribiste el comando correctamente\n` +
            `• También puedes usar \`/help\` (comando de barra)`
          )
          .setFooter({ text: `Tu prefix actual: ${customPrefix}` })
          .setTimestamp();

        return message.reply({ embeds: [notFoundEmbed] });
      }

      // Parsear argumentos usando las utilidades mejoradas
      const parsedOptions = parseMessageArgs(args, command.data, message);
      
      // Crear interaction falsa mejorada
      const fakeInteraction = createFakeInteraction(message, commandName, parsedOptions, command);

      // Verificar si el comando requiere permisos específicos
      if (command.data.default_member_permissions && message.member) {
        const hasPermission = message.member.permissions.has(command.data.default_member_permissions);
        if (!hasPermission) {
          const permissionEmbed = new EmbedBuilder()
            .setColor('#FF5733')
            .setTitle('❌ Permisos Insuficientes')
            .setDescription(
              `No tienes permisos para usar el comando \`${customPrefix}${commandName}\`.\n\n` +
              `**Permisos requeridos:** ${command.data.default_member_permissions}`
            )
            .setFooter({ text: 'Contacta a un administrador si crees que esto es un error' })
            .setTimestamp();

          return message.reply({ embeds: [permissionEmbed] });
        }
      }

      // Ejecutar el comando con manejo de errores
      try {
        await command.execute(fakeInteraction);
        
        // Log del uso del comando con prefix personalizado
        console.log(`[PREFIX] ${message.author.tag} used: ${customPrefix}${commandName} in ${message.guild?.name || 'DM'}`);
        
      } catch (commandError) {
        console.error(`Error executing command ${commandName} with custom prefix:`, commandError);
        
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF5733')
          .setTitle('❌ Error al Ejecutar Comando')
          .setDescription(
            `Ocurrió un error al ejecutar el comando \`${customPrefix}${commandName}\`.\n\n` +
            `**💡 Soluciones:**\n` +
            `• Intenta usar el comando con \`/\` en su lugar\n` +
            `• Verifica que proporcionaste los parámetros correctos\n` +
            `• Algunos comandos avanzados solo funcionan con \`/\`\n` +
            `• Contacta al administrador si el problema persiste`
          )
          .setFooter({ text: `Error reportado automáticamente` })
          .setTimestamp();

        message.reply({ embeds: [errorEmbed] }).catch(console.error);
      }

    } catch (error) {
      console.error('Error in messageCreate custom prefix handler:', error);
    }
  },
};
