const { Events, EmbedBuilder } = require('discord.js');
const ButtonRole = require('../models/ButtonRole');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'embed_setup') {
        const embed = new EmbedBuilder()
          .setTitle('Configuración de Embed Completada')
          .setDescription('¡Tu mensaje embed fue configurado exitosamente!')
          .setColor('Green');
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      return;
    }

    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      const panel = await ButtonRole.findOne({
        'buttons.customId': buttonId,
      });

      if (!panel) return;

      const button = panel.buttons.find((b) => b.customId === buttonId);
      const role = interaction.guild.roles.cache.get(button.roleId);

      if (!role) {
        const embed = new EmbedBuilder()
          .setTitle('Rol No Encontrado')
          .setDescription(
            'El rol asociado con este botón no pudo ser encontrado o ya no existe.'
          )
          .setColor('Red');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const member = interaction.member;
      const embed = new EmbedBuilder();

      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        embed
          .setTitle('Rol Removido')
          .setDescription(
            `Has removido exitosamente el rol **${role.name}**.`
          )
          .setColor('Red');
      } else {
        await member.roles.add(role);
        embed
          .setTitle('Rol Agregado')
          .setDescription(
            `Has agregado exitosamente el rol **${role.name}**.`
          )
          .setColor('Green');
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
