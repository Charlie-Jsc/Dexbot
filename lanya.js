require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Everything is up!');
});

app.listen(10000, () => {
  console.log('✅ Express server running on http://localhost:10000');
});
const { Client, GatewayIntentBits } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { autoPlayFunction } = require('./functions/autoPlay');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LL_PASSWORD,
      host: process.env.LL_HOST,
      port: parseInt(process.env.LL_PORT, 10),
      id: process.env.LL_NAME,
    },
  ],
  sendToShard: (guildId, payload) =>
    client.guilds.cache.get(guildId)?.shard?.send(payload),
  autoSkip: true,
  client: {
    id: process.env.DISCORD_CLIENT_ID,
    username: 'Lanya',
  },
  playerOptions: {
    onEmptyQueue: {
      destroyAfterMs: 30_000,
      autoPlayFunction: autoPlayFunction,
    },
  },
});

const styles = {
  successColor: chalk.bold.green,
  warningColor: chalk.bold.yellow,
  infoColor: chalk.bold.blue,
  commandColor: chalk.bold.cyan,
  userColor: chalk.bold.magenta,
  errorColor: chalk.red,
  highlightColor: chalk.bold.hex('#FFA500'),
  accentColor: chalk.bold.hex('#00FF7F'),
  secondaryColor: chalk.hex('#ADD8E6'),
  primaryColor: chalk.bold.hex('#FF1493'),
  dividerColor: chalk.hex('#FFD700'),
};

global.styles = styles;

const handlerFiles = fs
  .readdirSync(path.join(__dirname, 'handlers'))
  .filter((file) => file.endsWith('.js'));
let counter = 0;
for (const file of handlerFiles) {
  counter += 1;
  const handler = require(`./handlers/${file}`);
  if (typeof handler === 'function') {
    handler(client);
  }
}
console.log(
  global.styles.successColor(`✅ Successfully loaded ${counter} handlers`)
);

// Auto-deploy commands when bot is ready (ideal for production deployments)
client.once('ready', async () => {
  console.log(global.styles.successColor(`🤖 Bot ${client.user.tag} is now online!`));
  
  // Only deploy commands in production or when AUTO_DEPLOY_COMMANDS is true
  const shouldDeployCommands = process.env.NODE_ENV === 'production' || process.env.AUTO_DEPLOY_COMMANDS === 'true';
  
  if (shouldDeployCommands) {
    try {
      console.log(global.styles.infoColor('🔄 Auto-deploying slash commands...'));
      const deployCommands = require('./handlers/deployCommands');
      await deployCommands();
      console.log(global.styles.successColor('✅ Slash commands auto-deployed successfully!'));
    } catch (error) {
      console.error(global.styles.errorColor('❌ Error auto-deploying commands:'), error);
    }
  } else {
    console.log(global.styles.warningColor('⚠️ Command auto-deploy skipped. Set AUTO_DEPLOY_COMMANDS=true or NODE_ENV=production to enable.'));
  }
});

client.login(process.env.DISCORD_TOKEN);
