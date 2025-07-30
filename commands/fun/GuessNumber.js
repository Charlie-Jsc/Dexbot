const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Inicia un juego de adivinanza en un canal específico.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Inicia un nuevo juego de adivinanza.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('El canal donde se realizará el juego.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('number')
            .setDescription('El número a adivinar.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Detiene un juego de adivinanza en curso.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('El canal donde se está ejecutando el juego.')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageServer')) {
      return interaction.reply({
        content:
          '¡No tienes el permiso de `Gestionar Servidor` para gestionar el juego de adivinar números!',
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (subcommand === 'start') {
      const number = interaction.options.getInteger('number');

      if (activeGames.has(channel.id)) {
        return interaction.reply({
          content: `There is already an active game in ${channel}!`,
          ephemeral: true,
        });
      }

      activeGames.set(channel.id, { number, guesses: [] });

      try {
        await channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: false,
          }
        );
      } catch (error) {
        console.error('Failed to lock the channel:', error);
      }

      const startEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Guess the Number Game')
        .setDescription(
          `A new game has started in ${channel}!\n The number is \`${number}\``
        )
        .setFooter({ text: `Started by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [startEmbed] });
      return channel.send('The game has started! Start guessing the number!');
    }

    if (subcommand === 'stop') {
      if (!activeGames.has(channel.id)) {
        return interaction.reply({
          content: `There is no active game in ${channel}.`,
          ephemeral: true,
        });
      }

      activeGames.delete(channel.id);

      try {
        await channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: true,
          }
        );
      } catch (error) {
        console.error('Failed to unlock the channel:', error);
      }

      const stopEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Guess the Number Game')
        .setDescription(`The game in ${channel} has been stopped manually.`)
        .setTimestamp();

      return interaction.reply({ embeds: [stopEmbed] });
    }
  },
};

module.exports.activeGames = activeGames;
