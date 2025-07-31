const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configura el sistema de bienvenida')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Habilita o deshabilita el sistema de bienvenida')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('description')
        .setDescription('Establece la descripción del mensaje de bienvenida personalizado')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setchannel')
        .setDescription('Establece el canal de bienvenida')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('El canal para enviar mensajes de bienvenida')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('test')
        .setDescription('Vista previa del mensaje de bienvenida actual')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          '¡No tienes el permiso de `Administrador` para gestionar el sistema de bienvenida!',
        ephemeral: true,
      });
    }
    const { options, guild, user } = interaction;
    const serverId = guild.id;
    const subcommand = options.getSubcommand();

    let welcome = await Welcome.findOne({ serverId });

    if (!welcome) {
      welcome = new Welcome({ serverId });
      await welcome.save();
    }

    if (subcommand === 'toggle') {
      welcome.enabled = !welcome.enabled;
      await welcome.save();
      const toggleEmbed = new EmbedBuilder()
        .setColor(welcome.enabled ? '#4CAF50' : '#FF5733')
        .setTitle('Sistema de Bienvenida')
        .setDescription(
          `El sistema de bienvenida está ahora ${welcome.enabled ? 'habilitado' : 'deshabilitado'}. \n\n __**Nota:** Por favor establece el canal para enviar las bienvenidas usando \`/welcome setchannel\`__`
        )
        .setTimestamp();
      return interaction.reply({ embeds: [toggleEmbed] });
    }

    if (subcommand === 'description') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: '¡El sistema de bienvenida no está habilitado en este servidor!',
        });
      }

      const modal = new ModalBuilder()
        .setCustomId('welcome_description_modal')
        .setTitle('Configurar Mensaje de Bienvenida');

      const descriptionInput = new TextInputBuilder()
        .setCustomId('welcome_message_input')
        .setLabel('Mensaje de Bienvenida Personalizado')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Ejemplo: ¡Bienvenido {member} a {server}! 🎉')
        .setRequired(true)
        .setMaxLength(2000)
        .setValue(welcome.description || 'Bienvenido {member} a {server}');

      const actionRow = new ActionRowBuilder().addComponents(descriptionInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      try {
        const modalSubmit = await interaction.awaitModalSubmit({
          time: 300000, // 5 minutos
          filter: (i) => i.customId === 'welcome_description_modal' && i.user.id === interaction.user.id,
        });

        const customDescription = modalSubmit.fields.getTextInputValue('welcome_message_input');

        welcome.description = customDescription;
        await welcome.save();

        const successEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('✅ Mensaje de Bienvenida Actualizado')
          .setDescription(
            `**Nuevo mensaje de bienvenida:**\n\`\`\`${customDescription}\`\`\`\n\n**Variables disponibles:**\n` +
            "`{member}` - Menciona al usuario\n" +
            '`{server}` - Nombre del servidor\n' +
            '`{serverid}` - ID del servidor\n' +
            '`{userid}` - ID del usuario\n' +
            '`{joindate}` - Fecha de unión\n' +
            '`{accountage}` - Antigüedad de la cuenta\n' +
            '`{membercount}` - Cantidad de miembros\n' +
            '`{serverage}` - Antigüedad del servidor\n\n' +
            '💡 **Tip:** Usa `/welcome test` para previsualizar el mensaje'
          )
          .setTimestamp();

        await modalSubmit.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });

      } catch (error) {
        if (error.code === 'InteractionCollectorError') {
          // El modal expiró
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF5733')
            .setTitle('⏰ Tiempo Agotado')
            .setDescription(
              'El modal para configurar el mensaje de bienvenida expiró. Por favor inténtalo de nuevo.'
            )
            .setTimestamp();
          
          try {
            await interaction.followUp({
              embeds: [timeoutEmbed],
              ephemeral: true,
            });
          } catch (followUpError) {
            console.error('Error sending timeout message:', followUpError);
          }
        } else {
          console.error('Error in welcome description modal:', error);
          try {
            await interaction.followUp({
              content: '❌ Ocurrió un error al configurar el mensaje de bienvenida. Por favor inténtalo de nuevo.',
              ephemeral: true,
            });
          } catch (followUpError) {
            console.error('Error sending error message:', followUpError);
          }
        }
      }
    }

    if (subcommand === 'setchannel') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: '¡El sistema de bienvenida no está habilitado en este servidor!',
        });
      }
      const channel = interaction.options.getChannel('channel');

      welcome.channelId = channel.id;
      await welcome.save();

      const channelEmbed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('Canal de Bienvenida Establecido')
        .setDescription(`El canal de bienvenida ha sido establecido a ${channel}.`)
        .setTimestamp();
      return interaction.reply({
        embeds: [channelEmbed],
        ephemeral: true,
      });
    }

    if (subcommand === 'test') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: '¡El sistema de bienvenida no está habilitado en este servidor!',
        });
      }
      const memberCount = guild.memberCount;

      let description = welcome.description || 'Bienvenido {member} a {server}';
      description = description
        .replace(/{member}/g, interaction.user)
        .replace(/{server}/g, guild.name)
        .replace(/{serverid}/g, guild.id)
        .replace(/{userid}/g, user.id)
        .replace(/{joindate}/g, `<t:${Math.floor(Date.now() / 1000)}:F>`)
        .replace(/{accountage}/g, `<t:${Math.floor(user.createdAt / 1000)}:R>`)
        .replace(/{membercount}/g, memberCount)
        .replace(/{serverage}/g, `<t:${Math.floor(guild.createdAt / 1000)}:R>`);

      const testEmbed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('Vista Previa del Mensaje de Bienvenida')
        .setDescription(description)
        .setFooter({
          text: 'Así es como se verá el mensaje de bienvenida cuando un miembro se una.',
        })
        .setTimestamp();

      return interaction.reply({ embeds: [testEmbed], ephemeral: true });
    }
  },
};
