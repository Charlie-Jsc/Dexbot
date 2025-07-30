const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require('discord.js');
const Fuse = require('fuse.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(
      'Muestra una lista de comandos o información detallada sobre un comando específico.'
    )
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Obtener información detallada sobre un comando específico')
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('Buscar comandos usando palabras clave')
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().trim();
    const commandNames = [...interaction.client.commands.keys()];

    const filtered = commandNames
      .filter((name) => name.startsWith(focusedValue))
      .slice(0, 10)
      .map((name) => ({ name, value: name }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const { client } = interaction;
    const commandName = interaction.options.getString('command');
    const searchQuery = interaction.options.getString('search');
    // Custom category display names and emojis
    const categoryMap = {
      admin: { name: 'Administración', emoji: '⚙️' },
      fun: { name: 'Diversión y Juegos', emoji: '🎉' },
      level: { name: 'Tabla de Clasificación', emoji: '🎮' },
      music: { name: 'Música', emoji: '🎵' },
      moderation: { name: 'Moderación', emoji: '🔨' },
      utility: { name: 'Utilidades', emoji: '🪛' },
      minecraft: { name: 'Minecraft', emoji: '🟩' },
      info: { name: 'Información', emoji: 'ℹ️' },
      tickets: { name: 'Tickets', emoji: '🎫' },
    };
    const helpEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // Fuzzy search logic
    if (searchQuery) {
      const fuse = new Fuse([...client.commands.values()], {
        keys: ['data.name', 'data.description'],
        threshold: 0.4,
      });
      const results = fuse.search(searchQuery);
      if (!results.length) {
        return interaction.reply({
          content: `❌ No se encontraron comandos que coincidan con "${searchQuery}".`,
          ephemeral: true,
        });
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🔎 Resultados de búsqueda para "${searchQuery}"`)
        .setDescription(
          results
            .slice(0, 10)
            .map(
              (r, i) =>
                `**${i + 1}.** \`/${r.item.data.name}\` - ${r.item.data.description || 'Sin descripción.'}`
            )
            .join('\n')
        )
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (commandName) {
      const command = client.commands.get(commandName);
      if (!command) {
        return interaction.reply({
          content: '❌ ¡Comando no encontrado!',
          ephemeral: true,
        });
      }
      helpEmbed
        .setTitle(`🔍 Comando: **/${command.data.name}**`)
        .setDescription(command.data.description || 'No hay descripción disponible.')
        .addFields(
          {
            name: '🛠️ Uso',
            value:
              `\`/${command.data.name}\`` +
              (command.data.options?.length
                ? ' ' +
                  command.data.options.map((opt) => `<${opt.name}>`).join(' ')
                : ''),
          },
          {
            name: 'ℹ️ Detalles',
            value: `${command.data.description}`,
          },
          ...(command.data.options?.length
            ? [
                {
                  name: 'Options',
                  value: command.data.options
                    .map(
                      (opt) =>
                        `• \`${opt.name}\`: ${opt.description || 'No description.'}`
                    )
                    .join('\n'),
                },
              ]
            : [])
        );
      return interaction.reply({ embeds: [helpEmbed] });
    } else {
      const categories = {};
      client.commands.forEach((cmd) => {
        const rawCategory = cmd.category || 'Uncategorized';
        const display = categoryMap[rawCategory] || {
          name: rawCategory,
          emoji: '📁',
        };
        const key = `${display.emoji} ${display.name}`;
        if (!categories[key]) categories[key] = [];
        categories[key].push(cmd.data.name);
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('Choose a category')
        .addOptions(
          Object.keys(categories).map((category) => ({
            label: category,
            value: category,
            description: `Commands under ${category}`,
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      helpEmbed
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTitle('✨ Menú de Ayuda')
        .setDescription(
          'Navega por los comandos disponibles seleccionando una categoría del menú de abajo. Usa `/help <comando>` para información detallada sobre un comando específico.'
        )
        .addFields(
          Object.entries(categories).map(([category, commands]) => ({
            name: `${category}`,
            value: `${commands.length} comandos disponibles`,
            inline: true,
          }))
        );

      await interaction.reply({ embeds: [helpEmbed], components: [row] });

      const filter = (i) =>
        (i.customId === 'help-menu' ||
          i.customId === 'prev_page' ||
          i.customId === 'next_page') &&
        i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      let page = 0;
      let selectedCategory = Object.keys(categories)[0];
      const PAGE_SIZE = 6;

      async function updateCategoryEmbed(i, category, pageNum) {
        const commandsInCategory = categories[category];
        const totalPages = Math.ceil(commandsInCategory.length / PAGE_SIZE);
        const pagedCommands = commandsInCategory.slice(
          pageNum * PAGE_SIZE,
          (pageNum + 1) * PAGE_SIZE
        );
        const categoryEmbed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(
            `🔶 Commands: **${category}** (Page ${pageNum + 1}/${totalPages})`
          )
          .setDescription(
            pagedCommands
              .map((cmdName) => {
                const cmd = client.commands.get(cmdName);
                const cmdDescription =
                  cmd?.data?.description || 'No description available.';
                return `> \`/${cmdName}\` - ${cmdDescription}`;
              })
              .join('\n') || 'No commands available.'
          )
          .setFooter({
            text: `Solicitado por ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();
        const prevBtn = new ButtonBuilder()
          .setCustomId('prev_page')
          .setLabel('Previous')
          .setStyle('Secondary')
          .setDisabled(pageNum === 0);
        const nextBtn = new ButtonBuilder()
          .setCustomId('next_page')
          .setLabel('Next')
          .setStyle('Secondary')
          .setDisabled(pageNum + 1 >= totalPages);
        const paginationRow = new ActionRowBuilder().addComponents(
          prevBtn,
          nextBtn
        );
        await i.update({
          embeds: [categoryEmbed],
          components: [row, paginationRow],
        });
      }

      collector.on('collect', async (i) => {
        if (i.customId === 'help-menu') {
          selectedCategory = i.values[0];
          page = 0;
          await updateCategoryEmbed(i, selectedCategory, page);
        } else if (i.customId === 'prev_page') {
          if (page > 0) page--;
          await updateCategoryEmbed(i, selectedCategory, page);
        } else if (i.customId === 'next_page') {
          const commandsInCategory = categories[selectedCategory];
          const totalPages = Math.ceil(commandsInCategory.length / PAGE_SIZE);
          if (page + 1 < totalPages) page++;
          await updateCategoryEmbed(i, selectedCategory, page);
        }
      });

      collector.on('end', async () => {
        const disabledMenu = selectMenu.setDisabled(true);
        const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
        await interaction.editReply({ components: [disabledRow] });
      });
    }
  },
};
