const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pp')
    .setDescription(
      'Genera una representación aleatoria del tamaño de pp con un cumplido.'
    ),

  async execute(interaction) {
    const sizes = {
      small: {
        representation: '8==D',
        compliments: [
          '¡Se ve tierno!',
          '¿Eso siquiera es un tamaño?',
          "Un poco tímido, ¿no?",
          '¡Cada poquito cuenta!',
          '¡Perfecto para el bolsillo!',
          '¡Las grandes cosas vienen en paquetes pequeños!',
          '¡Pequeño pero poderoso!',
          '¡Fácil de manejar!',
          "¡Eres todo sobre la finura!",
          "¡Es un tamaño considerado!",
        ],
      },
      medium: {
        representation: '8===D',
        compliments: [
          '¡No está nada mal!',
          "¡Eso está decente!",
          '¡Podría usar un poco más, pero aún está bien!',
          '¡Justo el equilibrio correcto!',
          '¡Una elección sólida!',
          '¡Bueno para uso diario!',
          '¡Cómodamente dimensionado!',
          '¡Se ajusta perfectamente a la factura!',
          '¡Sabes cómo mantenerlo razonable!',
          "¡Ese es un tamaño agradable y sensato!",
        ],
      },
      average: {
        representation: '8====D',
        compliments: [
          '¡Bastante promedio!',
          "¡Justo lo que esperarías!",
          '¡Satisfactorio, pero nada de qué presumir!',
          '¡Un ejecutante confiable!',
          '¡Una apuesta segura!',
          '¡Cómodamente normal!',
          '¡No hay nada malo en ser promedio!',
          "¡Te mantienes real!",
          '¡Ese tamaño está perfecto!',
          '¡Una elección bien redondeada!',
        ],
      },
      large: {
        representation: '8=====D',
        compliments: [
          "¡Ahora eso es impresionante!",
          "¡Tienes algo que mostrar!",
          '¡Muy buen tamaño!',
          "¡Es un complace multitudes!",
          '¡Genial para divertirse!',
          '¡Definitivamente se destaca!',
          "¡Estás haciendo olas!",
          '¡Ese tamaño es difícil de ignorar!',
          '¡Sabes cómo llamar la atención!',
          "¡Esa es una mejora significativa!",
        ],
      },
      huge: {
        representation: '8======D',
        compliments: [
          '¡Wow, bastante impresionante!',
          "¡Esa es una declaración audaz!",
          '¡Sabes cómo causar una impresión!',
          '¡No es para los débiles de corazón!',
          '¡Un verdadero espectáculo!',
          '¡Hablas en serio!',
          "¡Eso es un cambio de juego!",
          "¡Tienes una confianza seria!",
          "¡Estás elevando el listón!",
          '¡Ese tamaño tiene presencia!',
        ],
      },
      extraLarge: {
        representation: '8=======D',
        compliments: [
          "¡Eso es masivo!",
          "¡Tienes confianza!",
          '¡Qué espectáculo para contemplar!',
          '¡Una verdadera obra maestra!',
          "¡Es difícil de ignorar!",
          '¡Una unidad absoluta!',
          "¡Estás en una liga propia!",
          "¡Realmente te has superado!",
          "¡Esa es una elección audaz!",
          '¡Esperando una ovación de pie!',
        ],
      },
      massive: {
        representation: '8========D',
        compliments: [
          '¡Verdaderamente una vista que ver!',
          "¡Eres un presumido!",
          "¡Eso es simplemente extra!",
          '¡Listo para conquistar el mundo!',
          "¡Te has superado!",
          "¡Eso es impresionante, sin duda!",
          "¡Vas por el oro!",
          '¡Ese tamaño es simplemente monumental!',
          "¡No juegas en pequeño!",
          '¡Espera algo de atención seria!',
        ],
      },
      legendary: {
        representation: '8=========D',
        compliments: [
          '¡Un tamaño legendario!',
          '¡Increíble!',
          "¡Eso es un mito en formación!",
          '¡Proporciones épicas!',
          "¡Has alcanzado la cima!",
          '¡Una verdadera leyenda!',
          "¡Eres materia de leyendas!",
          '¡Ese tamaño es prácticamente mítico!',
          "¡Estás reescribiendo el libro sobre tamaños!",
          '¡Absolutamente icónico!',
        ],
      },
    };

    const sizeKeys = Object.keys(sizes);
    const selectedSize = sizeKeys[Math.floor(Math.random() * sizeKeys.length)];
    const { representation, compliments } = sizes[selectedSize];

    const randomCompliment =
      compliments[Math.floor(Math.random() * compliments.length)];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Generador de Tamaño de pp')
      .addFields(
        { name: 'Tamaño de pp:', value: representation, inline: true },
        {
          name: 'Categoría de Tamaño:',
          value: selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1),
          inline: true,
        },
        { name: 'Cumplido:', value: randomCompliment, inline: false }
      )
      .setFooter({
        text: '¡Disfruta la diversión!',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
