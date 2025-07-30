const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Traducir texto a un idioma específico.')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('El texto a traducir')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription(
          'El idioma al que traducir (ej: "es" para español, "fr" para francés)'
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const targetLanguage = interaction.options.getString('language');

    try {
      const res = await translate(text, { to: targetLanguage });

      const translationEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Traducción`)
        .addFields(
          {
            name: 'Texto Original',
            value: `\`${text}\``,
            inline: false,
          },
          {
            name: 'Texto Traducido',
            value: `\`${res.text}\``,
            inline: false,
          },
          {
            name: 'Language',
            value: targetLanguage.toUpperCase(),
            inline: true,
          }
        )
        .setFooter({ text: 'Powered by Google Translate' })
        .setTimestamp();

      const languageButton = new ButtonBuilder()
        .setLabel('Language Codes')
        .setStyle(ButtonStyle.Link)
        .setURL('https://cloud.google.com/translate/docs/languages');

      const row = new ActionRowBuilder().addComponents(languageButton);

      await interaction.reply({
        embeds: [translationEmbed],
        components: [row],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        'An error occurred while trying to translate the text. Please try again.'
      );
    }
  },
};
