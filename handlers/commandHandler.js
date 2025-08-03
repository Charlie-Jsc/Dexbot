const fs = require('fs');
const path = require('path');
module.exports = (client) => {
  client.commands = new Map();
  client.ownerCommands = new Map(); // Mapa separado para comandos de propietario

  const commandsPath = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsPath);
  
  let commandCount = 0;
  let categoryCount = 0;
  let ownerCommandCount = 0;

  categories.forEach((category) => {
    // 🔒 Excluir carpeta 'owner' del cargado normal
    if (category === 'owner') {
      console.log('⚠️ Saltando carpeta "owner" - comandos especiales');
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

    categoryCount++;

    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));
        
        if (!command.data || !command.execute) {
          console.log(`⚠️ Comando inválido: ${file}`);
          continue;
        }

        client.commands.set(command.data.name, { ...command, category });
        commandCount++;
      } catch (error) {
        console.log(`❌ Error cargando ${file}: ${error.message}`);
      }
    }
  });

  // 🔒 Cargar comandos de propietario por separado
  const ownerPath = path.join(commandsPath, 'owner');
  if (fs.existsSync(ownerPath)) {
    const ownerFiles = fs
      .readdirSync(ownerPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of ownerFiles) {
      try {
        const command = require(path.join(ownerPath, file));
        
        if (!command.data || !command.execute) {
          console.log(`⚠️ Comando de propietario inválido: ${file}`);
          continue;
        }

        client.ownerCommands.set(command.data.name, { ...command, category: 'owner' });
        ownerCommandCount++;
      } catch (error) {
        console.log(`❌ Error cargando comando de propietario ${file}: ${error.message}`);
      }
    }
  }

  console.log(
    `✅ Loaded ${commandCount} commands across ${categoryCount} categories.`
  );
  
  if (ownerCommandCount > 0) {
    console.log(
      `🔒 Loaded ${ownerCommandCount} owner commands (not globally registered).`
    );
  }
};
