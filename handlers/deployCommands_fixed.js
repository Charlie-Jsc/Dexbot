require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async () => {
  const commands = [];

  const commandsPath = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsPath);

  categories.forEach((category) => {
    // 🔒 Excluir carpeta 'owner' del deploy global
    if (category === 'owner') {
      console.log('⚠️ Saltando comandos de propietario del deploy global');
      return;
    }

    const categoryPath = path.join(commandsPath, category);
    
    // Verificar que sea una carpeta
    if (!fs.statSync(categoryPath).isDirectory()) {
      return;
    }

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));
        
        if (!command.data) {
          console.log(`⚠️ Comando sin data: ${file}`);
          continue;
        }

        commands.push(command.data.toJSON());
      } catch (error) {
        console.error(`❌ Error cargando ${file}: ${error.message}`);
      }
    }
  });

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(`✅ Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
};

// 🔒 Función para deploy de comandos de propietario
const deployOwnerCommands = async (client) => {
  const supportServerId = process.env.SUPPORT_SERVER_ID;
  
  if (!supportServerId || supportServerId === 'YOUR_SUPPORT_SERVER_ID_HERE') {
    console.log('⚠️ SUPPORT_SERVER_ID no configurado - comandos de propietario no registrados');
    return;
  }

  const ownerCommands = [];
  const ownerPath = path.join(__dirname, '../commands/owner');

  if (!fs.existsSync(ownerPath)) {
    console.log('ℹ️ No se encontró carpeta de comandos de propietario');
    return;
  }

  const ownerFiles = fs
    .readdirSync(ownerPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of ownerFiles) {
    try {
      const command = require(path.join(ownerPath, file));
      
      if (!command.data) {
        console.log(`⚠️ Comando de propietario sin data: ${file}`);
        continue;
      }

      ownerCommands.push(command.data.toJSON());
    } catch (error) {
      console.error(`❌ Error cargando comando de propietario ${file}: ${error.message}`);
    }
  }

  if (ownerCommands.length === 0) {
    console.log('ℹ️ No hay comandos de propietario para registrar');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`🔒 Registrando ${ownerCommands.length} comandos de propietario en servidor de soporte...`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, supportServerId),
      { body: ownerCommands }
    );

    console.log(`✅ Comandos de propietario registrados exitosamente en servidor ${supportServerId}`);
  } catch (error) {
    console.error(`❌ Error registrando comandos de propietario: ${error.message}`);
  }
};

module.exports.deployOwnerCommands = deployOwnerCommands;
