const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Obtiene un meme aleatorio de r/memes'),

  async execute(interaction) {
    try {
      const response = await fetch('https://meme-api.com/gimme/memes');
      const json = await response.json();

      if (json && json.url) {
        const meme = {
          title: json.title,
          url: json.url,
          postLink: json.postLink,
          subreddit: json.subreddit,
          author: json.author,
          ups: json.ups,
        };

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(meme.title)
          .setURL(meme.postLink)
          .setImage(meme.url)
          .setFooter({
            text: `Meme de r/${meme.subreddit} | Publicado por ${meme.author} | Votos positivos: ${meme.ups}`,
          });

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply("Lo siento, no pude encontrar un meme en este momento.");
      }
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply(
        'Hubo un error al tratar de obtener un meme. Por favor, inténtalo de nuevo más tarde.'
      );
    }
  },
};
