const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const ButtonRole = require('../../models/ButtonRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttonrole')
    .setDescription('Gestiona paneles de roles con botones')
    .addSubcommand((subcommand) =>
      subcommand.setName('setup').setDescription('Crea un panel de roles con botones')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('send')
        .setDescription('Envía un panel de roles con botones a un canal')
        .addStringOption((option) =>
          option
            .setName('panel_name')
            .setDescription('El nombre del panel')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      await handleSetup(interaction);
    } else if (subcommand === 'send') {
      await handleSend(interaction);
    }
  },
};

async function handleSetup(interaction) {
  if (!interaction.member.permissions.has('ManageRoles')) {
    return interaction.reply({
      content: 'Necesitas el permiso de Gestionar Roles para usar este comando.',
      ephemeral: true,
    });
  }
  const panels = await ButtonRole.find({ guildId: interaction.guild.id });

  if (panels.length >= 25) {
    return await interaction.reply({
      content: `Has alcanzado el límite máximo de ${maxButtonRoles} roles con botones en este servidor.`,
      ephemeral: true,
    });
  }

  const setupEmbed = new EmbedBuilder()
    .setTitle('Configuración del Panel de Roles con Botones')
    .setDescription(
      'Elige si quieres crear un **mensaje normal** o un **mensaje embed** para tu panel de roles con botones.'
    )
    .setColor('Blue');

  const setupButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('normal_message')
      .setLabel('Mensaje Normal')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_message')
      .setLabel('Mensaje Embed')
      .setStyle(ButtonStyle.Success)
  );

  const reply = await interaction.reply({
    embeds: [setupEmbed],
    components: [setupButtons],
    ephemeral: true,
  });

  const collector = reply.createMessageComponentCollector({ time: 60000 });

  collector.on('collect', async (buttonInteraction) => {
    if (buttonInteraction.user.id !== interaction.user.id) {
      return buttonInteraction.reply({
        content: 'Esta configuración no es para ti.',
        ephemeral: true,
      });
    }

    if (buttonInteraction.customId === 'normal_message') {
      await handleNormalMessageSetup(interaction, buttonInteraction);
    } else if (buttonInteraction.customId === 'embed_message') {
      await handleEmbedMessageSetup(interaction, buttonInteraction);
    }
  });

  collector.on('end', () => {
    interaction.editReply({ components: [] });
  });
}

async function handleNormalMessageSetup(interaction, buttonInteraction) {
  await buttonInteraction.deferUpdate();

  const messagePrompt = new EmbedBuilder()
    .setTitle('Configuración de Mensaje Normal')
    .setDescription('Por favor, escribe el contenido del mensaje para tu panel.')
    .setColor('Blue');

  await interaction.channel.send({ embeds: [messagePrompt] });

  const collectorFilter = (m) => m.author.id === interaction.user.id;
  const messageResponse = await interaction.channel.awaitMessages({
    filter: collectorFilter,
    max: 1,
    time: 60000,
  });

  const messageContent = messageResponse.first().content;

  await savePanel(interaction, { type: 'message', content: messageContent });
}

async function handleEmbedMessageSetup(interaction, buttonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_setup')
    .setTitle('Configuración de Embed');

  const titleInput = new TextInputBuilder()
    .setCustomId('embed_title')
    .setLabel('Título (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Introduce el título del embed')
    .setRequired(false);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('embed_description')
    .setLabel('Descripción (requerida)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Introduce la descripción del embed')
    .setRequired(true);

  const footerInput = new TextInputBuilder()
    .setCustomId('embed_footer')
    .setLabel('Pie de página (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Introduce el pie de página del embed')
    .setRequired(false);

  const imageUriInput = new TextInputBuilder()
    .setCustomId('embed_image_uri')
    .setLabel('URI de Imagen (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Introduce la URL de la imagen')
    .setRequired(false);

  const modalActionRow1 = new ActionRowBuilder().addComponents(titleInput);
  const modalActionRow2 = new ActionRowBuilder().addComponents(
    descriptionInput
  );
  const modalActionRow3 = new ActionRowBuilder().addComponents(footerInput);
  const modalActionRow4 = new ActionRowBuilder().addComponents(imageUriInput);

  modal.addComponents(
    modalActionRow1,
    modalActionRow2,
    modalActionRow3,
    modalActionRow4
  );

  await buttonInteraction.showModal(modal);

  const submitted = await buttonInteraction.awaitModalSubmit({ time: 60000 });

  const title = submitted.fields.getTextInputValue('embed_title') || null;
  const description = submitted.fields.getTextInputValue('embed_description');
  const footer = submitted.fields.getTextInputValue('embed_footer') || null;
  const imageUri =
    submitted.fields.getTextInputValue('embed_image_uri') || null;

  const embedData = {
    type: 'embed',
    content: { title, description, footer, imageUri },
  };

  await savePanel(interaction, embedData);
}

async function savePanel(interaction, panelData) {
  const collectorFilter = (m) => m.author.id === interaction.user.id;

  let panelName = '';
  let panelExists = true;

  while (panelExists) {
    const panelNamePrompt = new EmbedBuilder()
      .setTitle('Nombre del Panel')
      .setDescription('¿Cómo se llamará el panel?')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [panelNamePrompt] });

    const panelNameResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    panelName = panelNameResponse.first().content;

    const existingPanel = await ButtonRole.findOne({
      guildId: interaction.guild.id,
      panelName,
    });

    if (existingPanel) {
      await interaction.channel.send({
        content: `Ya existe un panel con el nombre **${panelName}**. Por favor, elige otro nombre.`,
      });
    } else {
      panelExists = false;
    }
  }

  const buttons = [];
  let addingButtons = true;

  while (addingButtons) {
    const buttonLabelPrompt = new EmbedBuilder()
      .setTitle('Etiqueta del Botón')
      .setDescription('Introduce una etiqueta para el botón:')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonLabelPrompt] });

    const labelResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const label = labelResponse.first().content;

    const buttonRolePrompt = new EmbedBuilder()
      .setTitle('Rol del Botón')
      .setDescription('Menciona el rol o proporciona el ID del rol:')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonRolePrompt] });

    const roleResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const roleId =
      roleResponse.first().mentions.roles.first()?.id ||
      roleResponse.first().content;

    const buttonStylePrompt = new EmbedBuilder()
      .setTitle('Estilo del Botón')
      .setDescription(
        'Elige un estilo de botón: `Primary`, `Secondary`, `Success`, `Danger`'
      )
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonStylePrompt] });

    const styleResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const style =
      ButtonStyle[styleResponse.first().content] || ButtonStyle.Primary;

    const customId = `${interaction.guild.id}-${Date.now()}-${buttons.length}`;
    buttons.push({ label, roleId, style, customId });

    const continuePrompt = new EmbedBuilder()
      .setTitle('¿Añadir Otro Botón?')
      .setDescription('¿Quieres añadir otro botón? (yes/no)')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [continuePrompt] });

    const continueResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    if (continueResponse.first().content.toLowerCase() !== 'yes')
      addingButtons = false;
  }

  const targetChannelPrompt = new EmbedBuilder()
    .setTitle('Canal de Destino')
    .setDescription('Menciona el canal al que enviar el panel:')
    .setColor('Blue');
  await interaction.channel.send({ embeds: [targetChannelPrompt] });

  const channelResponse = await interaction.channel.awaitMessages({
    filter: collectorFilter,
    max: 1,
    time: 60000,
  });
  const channelId =
    channelResponse.first().mentions.channels.first()?.id ||
    channelResponse.first().content;

  const buttonRole = new ButtonRole({
    guildId: interaction.guild.id,
    panelName,
    panelData,
    buttons,
    channelId,
  });

  await buttonRole.save();

  const successEmbed = new EmbedBuilder()
    .setTitle('Panel Guardado')
    .setDescription(`Tu panel **${panelName}** ha sido guardado exitosamente.`)
    .setColor('Green');

  await interaction.channel.send({ embeds: [successEmbed] });
}

async function handleSend(interaction) {
  if (!interaction.member.permissions.has('ManageRoles')) {
    return interaction.reply({
      content: 'Necesitas el permiso de Gestionar Roles para usar este comando.',
      ephemeral: true,
    });
  }
  const panelName = interaction.options.getString('panel_name');

  const buttonRole = await ButtonRole.findOne({
    guildId: interaction.guild.id,
    panelName,
  });

  if (!buttonRole) {
    return interaction.reply({
      content: `Panel **${panelName}** no encontrado.`,
      ephemeral: true,
    });
  }

  const channel = interaction.guild.channels.cache.get(buttonRole.channelId);
  if (!channel) {
    return interaction.reply({
      content: `El canal para el panel **${panelName}** no pudo ser encontrado.`,
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setDescription(buttonRole.panelData.content.description)
    .setColor('Blue');

  if (buttonRole.panelData.content.title) {
    embed.setTitle(buttonRole.panelData.content.title);
  }

  if (buttonRole.panelData.content.footer) {
    embed.setFooter({ text: buttonRole.panelData.content.footer });
  }

  if (buttonRole.panelData.content.imageUri) {
    embed.setImage(buttonRole.panelData.content.imageUri);
  }

  const row = new ActionRowBuilder();

  buttonRole.buttons.forEach((button) => {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(button.label)
        .setStyle(button.style)
        .setCustomId(button.customId)
    );
  });

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.reply({
    content: `Panel **${panelName}** enviado a <#${buttonRole.channelId}>.`,
    ephemeral: true,
  });
}
