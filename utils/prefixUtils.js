const { User, GuildChannel, Role } = require('discord.js');

/**
 * Convierte argumentos de mensaje de texto a formato de opciones de slash commands
 * @param {Array} args - Argumentos del mensaje
 * @param {Object} commandData - Datos del comando slash
 * @param {Object} message - Objeto del mensaje
 * @returns {Object} Opciones parseadas
 */
function parseMessageArgs(args, commandData, message) {
  const parsedOptions = {};
  const options = commandData.options || [];
  
  // Si el comando tiene subcomandos
  if (options.some(opt => opt.type === 1)) { // ApplicationCommandOptionType.Subcommand = 1
    const subcommandName = args[0];
    const subcommand = options.find(opt => opt.name === subcommandName);
    
    if (subcommand) {
      parsedOptions._subcommand = subcommandName;
      parsedOptions._subcommandOptions = subcommand.options || [];
      
      // Parsear opciones del subcomando
      return parseOptionsFromArgs(args.slice(1), subcommand.options || [], message);
    }
  } else {
    // Comando sin subcomandos
    return parseOptionsFromArgs(args, options, message);
  }
  
  return parsedOptions;
}

/**
 * Parsea opciones específicas de los argumentos
 */
function parseOptionsFromArgs(args, options, message) {
  const parsed = {};
  
  options.forEach((option, index) => {
    const arg = args[index];
    if (!arg) return;
    
    switch (option.type) {
      case 3: // STRING
        parsed[option.name] = arg;
        break;
      case 4: // INTEGER
        const intValue = parseInt(arg);
        if (!isNaN(intValue)) parsed[option.name] = intValue;
        break;
      case 10: // NUMBER
        const numValue = parseFloat(arg);
        if (!isNaN(numValue)) parsed[option.name] = numValue;
        break;
      case 5: // BOOLEAN
        parsed[option.name] = ['true', 'yes', '1', 'on'].includes(arg.toLowerCase());
        break;
      case 6: // USER
        const userMention = arg.match(/<@!?(\d+)>/);
        if (userMention) {
          const userId = userMention[1];
          const user = message.client.users.cache.get(userId);
          if (user) parsed[option.name] = user;
        }
        break;
      case 7: // CHANNEL
        const channelMention = arg.match(/<#(\d+)>/);
        if (channelMention) {
          const channelId = channelMention[1];
          const channel = message.guild?.channels.cache.get(channelId);
          if (channel) parsed[option.name] = channel;
        }
        break;
      case 8: // ROLE
        const roleMention = arg.match(/<@&(\d+)>/);
        if (roleMention) {
          const roleId = roleMention[1];
          const role = message.guild?.roles.cache.get(roleId);
          if (role) parsed[option.name] = role;
        }
        break;
    }
  });
  
  return parsed;
}

/**
 * Crea un objeto interaction-like más completo para comandos con prefix personalizado
 */
function createFakeInteraction(message, commandName, parsedOptions, command) {
  const fakeInteraction = {
    // Propiedades básicas
    user: message.author,
    member: message.member,
    guild: message.guild,
    channel: message.channel,
    client: message.client,
    commandName: commandName,
    guildId: message.guild?.id,
    channelId: message.channel.id,
    createdTimestamp: message.createdTimestamp,
    
    // Métodos de tipo
    isCommand: () => true,
    isChatInputCommand: () => true,
    isButton: () => false,
    isSelectMenu: () => false,
    isModalSubmit: () => false,
    
    // Objeto options mejorado
    options: {
      getString: (name) => parsedOptions[name] || null,
      getUser: (name) => parsedOptions[name] || null,
      getChannel: (name) => parsedOptions[name] || null,
      getRole: (name) => parsedOptions[name] || null,
      getInteger: (name) => parsedOptions[name] || null,
      getNumber: (name) => parsedOptions[name] || null,
      getBoolean: (name) => parsedOptions[name] || false,
      getSubcommand: () => parsedOptions._subcommand || null,
      getSubcommandGroup: () => null,
      getMentionable: (name) => parsedOptions[name] || null,
      getAttachment: (name) => null, // No soportado en mensajes de texto
    },
    
    // Métodos de respuesta
    reply: async (content) => {
      try {
        return await message.reply(content);
      } catch (error) {
        console.error('Error in fake interaction reply:', error);
        return null;
      }
    },
    
    followUp: async (content) => {
      try {
        return await message.channel.send(content);
      } catch (error) {
        console.error('Error in fake interaction followUp:', error);
        return null;
      }
    },
    
    editReply: async (content) => {
      try {
        return await message.channel.send(content);
      } catch (error) {
        console.error('Error in fake interaction editReply:', error);
        return null;
      }
    },
    
    deferReply: async (options = {}) => {
      // Para mensajes normales, no necesitamos defer
      return Promise.resolve();
    },
    
    deleteReply: async () => {
      // No aplicable para mensajes normales
      return Promise.resolve();
    },
    
    // Métodos de modal (no aplicables pero incluidos para compatibilidad)
    showModal: async (modal) => {
      await message.reply({
        content: '❌ Los modales no están disponibles con comandos de prefix personalizado. Usa el comando con `/` para esta funcionalidad.',
        ephemeral: true
      });
      return Promise.resolve();
    },
    
    awaitModalSubmit: async (options) => {
      throw new Error('Modal submission not supported with custom prefix commands');
    }
  };
  
  return fakeInteraction;
}

module.exports = {
  parseMessageArgs,
  createFakeInteraction,
  parseOptionsFromArgs
};
