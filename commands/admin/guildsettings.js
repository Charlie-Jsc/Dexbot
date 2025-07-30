const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GuildSettings } = require('../../models/Level');
const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guildsettings')
    .setDescription('Ver la configuración del servidor'),

  async execute(interaction) {
    const { guild } = interaction;
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          '¡No tienes el permiso de `Administrador` para gestionar el servidor!',
        ephemeral: true,
      });
    }

    const guildSettings = await GuildSettings.findOne({ guildId: guild.id });
    if (!guildSettings) {
      return interaction.reply({
        content: '¡Configuración del servidor no encontrada!',
        ephemeral: true,
      });
    }

    const welcomeSettings = await Welcome.findOne({ serverId: guild.id });

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle(`Configuración del Servidor para ${guild.name}`)
      .setTimestamp();

    embed.addFields({
      name: '**Configuración de Niveles**',
      value: '\u200B',
      inline: false,
    });
    if (guildSettings.levelingEnabled) {
      embed.addFields(
        { name: 'Sistema de Niveles', value: 'Habilitado', inline: true },
        {
          name: 'Tasa de XP',
          value: `${guildSettings.xpRate}`,
          inline: true,
        },
        {
          name: 'Canal de Subida de Nivel',
          value: guildSettings.levelUpChannelId
            ? `<#${guildSettings.levelUpChannelId}>`
            : 'No establecido',
          inline: true,
        }
      );
    } else {
      embed.addFields({
        name: 'Sistema de Niveles',
        value: 'Deshabilitado',
        inline: true,
      });
    }

    embed.addFields({
      name: '**Configuración del Sistema de Bienvenida**',
      value: '\u200B',
      inline: false,
    });
    if (welcomeSettings && welcomeSettings.enabled) {
      embed.addFields(
        { name: 'Sistema de Bienvenida', value: 'Habilitado', inline: true },
        {
          name: 'Canal de Bienvenida',
          value: welcomeSettings.channelId
            ? `<#${welcomeSettings.channelId}>`
            : 'No establecido',
          inline: true,
        }
      );
    } else {
      embed.addFields({
        name: 'Sistema de Bienvenida',
        value: 'Deshabilitado',
        inline: true,
      });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
