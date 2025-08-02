require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async () => {
  const commands = [];
  let commandCount = 0;

  const commandsPath = path.join(__dirname, '../commands');
  
  try {
    fs.readdirSync(commandsPath).forEach((category) => {
      const categoryPath = path.join(commandsPath, category);
      
      if (!fs.statSync(categoryPath).isDirectory()) return;
      
      const commandFiles = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith('.js'));

      for (const file of commandFiles) {
        try {
          const filePath = path.join(categoryPath, file);
          delete require.cache[require.resolve(filePath)]; // Clear cache
          const command = require(filePath);
          
          if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            commandCount++;
            console.log(global.styles?.successColor ? 
              global.styles.successColor(`✅ Loaded command: ${command.data.name}`) : 
              `✅ Loaded command: ${command.data.name}`
            );
          } else {
            console.log(global.styles?.warningColor ? 
              global.styles.warningColor(`⚠️ Skipping ${file}: Missing data or execute property`) : 
              `⚠️ Skipping ${file}: Missing data or execute property`
            );
          }
        } catch (error) {
          console.error(global.styles?.errorColor ? 
            global.styles.errorColor(`❌ Error loading ${file}:`) : 
            `❌ Error loading ${file}:`, error.message
          );
        }
      }
    });
  } catch (error) {
    console.error('❌ Error reading commands directory:', error);
    throw error;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(
      global.styles?.warningColor ? 
        global.styles.warningColor(`🔄 Started refreshing ${commandCount} application (/) commands.`) :
        `🔄 Started refreshing ${commandCount} application (/) commands.`
    );

    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(
      global.styles?.commandColor ? 
        global.styles.commandColor(`✅ Successfully reloaded ${data.length} application (/) commands.`) :
        `✅ Successfully reloaded ${data.length} application (/) commands.`
    );
    
    // Log the registered commands for verification
    console.log(global.styles?.infoColor ? 
      global.styles.infoColor('📋 Registered commands:') : 
      '📋 Registered commands:'
    );
    data.forEach((cmd, index) => {
      console.log(`  ${index + 1}. /${cmd.name} - ${cmd.description}`);
    });
    
    return data;
  } catch (error) {
    console.error(global.styles?.errorColor ? 
      global.styles.errorColor('❌ Error deploying commands:') : 
      '❌ Error deploying commands:', error
    );
    throw error;
  }
};
