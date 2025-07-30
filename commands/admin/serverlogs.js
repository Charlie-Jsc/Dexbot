const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverlogs')
    .setDescription('Gestiona la configuración de logs del servidor')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setchannel')
        .setDescription('Establece el canal de logs')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('El canal al que enviar los logs')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Activa o desactiva una categoría de logs')
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('La categoría de logs a activar/desactivar')
            .setRequired(true)
            .addChoices(
              { name: 'Mensajes', value: 'messages' },
              { name: 'Apodos', value: 'nicknames' },
              { name: 'Member Events', value: 'memberEvents' },
              { name: 'Channel Events', value: 'channelEvents' },
              { name: 'Role Events', value: 'roleEvents' },
              { name: 'Voice Events', value: 'voiceEvents' },
              { name: 'Thread Events', value: 'threadEvents' },
              { name: 'Boosts', value: 'boosts' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('View the current logging settings')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('reset').setDescription('Reset all logging settings')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You do not have `Administrator` permission to manage levels!',
        ephemeral: true,
      });
    }

    let logSettings = await ServerLog.findOne({ guildId });
    if (!logSettings) {
      logSettings = new ServerLog({ guildId });
      await logSettings.save();
    }

    if (subcommand === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      logSettings.logChannel = channel.id;
      await logSettings.save();

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Server Logs Channel Updated')
        .setDescription(`Log channel has been set to ${channel}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'toggle') {
      const category = interaction.options.getString('category');
      logSettings.categories[category] = !logSettings.categories[category];
      await logSettings.save();

      const status = logSettings.categories[category] ? 'enabled' : 'disabled';
      const color = logSettings.categories[category] ? '#00ff00' : '#ff0000';
      const emoji = logSettings.categories[category] ? '🟢' : '🔴';

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('Logging Category Toggled')
        .setDescription(
          `\`${emoji}\` **${category}** logging has been ${status}.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'status') {
      const logChannel = logSettings.logChannel
        ? `<#${logSettings.logChannel}>`
        : 'Not set';

      const categories = Object.entries(logSettings.categories)
        .map(([key, value]) => {
          const emoji = value ? '`🟢`' : '`🔴`';
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
          return `${emoji} **${formattedKey}**`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Server Logs Status')
        .addFields(
          { name: 'Log Channel', value: logChannel, inline: false },
          {
            name: 'Logging Categories',
            value: categories,
            inline: false,
          }
        )
        .setFooter({ text: '🟢 Enabled | 🔴 Disabled' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'reset') {
      logSettings.categories = {
        messages: false,
        nicknames: false,
        memberEvents: false,
        channelEvents: false,
        roleEvents: false,
        voiceEvents: false,
        threadEvents: false,
        boosts: false,
      };
      logSettings.logChannel = null;
      await logSettings.save();

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Server Logs Reset')
        .setDescription('All logging settings have been reset to default.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
