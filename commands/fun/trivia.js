const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fetch = require('node-fetch');
const { decode } = require('html-entities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Obtiene una pregunta de trivia aleatoria.'),

  async execute(interaction) {
    const response = await fetch(
      'https://opentdb.com/api.php?amount=1&type=multiple'
    );
    const triviaData = await response.json();
    const question = triviaData.results[0];

    const decodedQuestion = decode(question.question);
    const decodedCorrectAnswer = decode(question.correct_answer);
    const decodedIncorrectAnswers = question.incorrect_answers.map((answer) =>
      decode(answer)
    );

    const allAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
    const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

    const answerLabels = ['A', 'B', 'C', 'D'];
    const answerFields = shuffledAnswers.map((answer, index) => ({
      name: `${answerLabels[index]})`,
      value: answer,
      inline: true,
    }));

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Pregunta de Trivia')
      .setDescription(decodedQuestion)
      .addFields(answerFields)
      .setFooter({ text: 'Elige tu respuesta haciendo clic en un botón' });

    const buttons = answerLabels.map((label, index) =>
      new ButtonBuilder()
        .setCustomId(`answer_${label}`)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i) => {
      return i.user.id === interaction.user.id;
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on('collect', async (i) => {
      await i.deferUpdate();

      const selectedAnswer = i.customId.split('_')[1];
      const correctAnswerIndex = shuffledAnswers.indexOf(decodedCorrectAnswer);
      const correctAnswerLabel = answerLabels[correctAnswerIndex];

      const responseEmbed = new EmbedBuilder()
        .setColor(selectedAnswer === correctAnswerLabel ? 0x00ff00 : 0xff0000)
        .setTitle(
          selectedAnswer === correctAnswerLabel ? '¡Correcto!' : '¡Incorrecto!'
        )
        .setDescription(
          selectedAnswer === correctAnswerLabel
            ? '¡Buen trabajo! 🎉'
            : `¡Oops! La respuesta correcta era: **${correctAnswerLabel}) ${decodedCorrectAnswer}**`
        );

      // Disable all buttons after an answer is selected
      const disabledRow = new ActionRowBuilder().addComponents(
        buttons.map((btn) => btn.setDisabled(true))
      );

      await interaction.editReply({
        components: [disabledRow],
      });

      await interaction.followUp({ embeds: [responseEmbed] });
      collector.stop();
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        // Disable buttons after time runs out
        const disabledRow = new ActionRowBuilder().addComponents(
          buttons.map((btn) => btn.setDisabled(true))
        );

        interaction.editReply({
          content:
            '¡Se acabó el tiempo! La respuesta correcta era: **' +
            correctAnswerLabel +
            ') ' +
            decodedCorrectAnswer +
            '**',
          components: [disabledRow],
        });
      }
    });
  },
};
