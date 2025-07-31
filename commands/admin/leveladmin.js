const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { GuildSettings, LevelRoles, MemberData } = require('../../models/Level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leveladmin')
    .setDescription('Gestiona el sistema de niveles')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('addlevelrole')
        .setDescription('Añade un rol para ser asignado en un nivel específico')
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('Nivel en el que asignar el rol')
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('Rol a asignar')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('removelevelrole')
        .setDescription('Elimina un rol asignado en un nivel específico')
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('Nivel del que eliminar el rol')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('addlevel')
        .setDescription('Añade niveles a un usuario')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Usuario al que añadir niveles')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('Niveles a añadir')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setlevel')
        .setDescription('Establece el nivel de un usuario')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Usuario al que establecer el nivel')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('Nivel a establecer')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('removelevel')
        .setDescription('Quita niveles a un usuario')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Usuario al que quitar niveles')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('Niveles a quitar')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setlevelupchannel')
        .setDescription('Establece el canal para anuncios de subida de nivel')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('El canal donde enviar los anuncios')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setxprate')
        .setDescription('Establece la tasa de crecimiento de XP')
        .addNumberOption((option) =>
          option
            .setName('rate')
            .setDescription('El multiplicador de tasa de XP')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Activa o desactiva el sistema de niveles')
        .addStringOption((option) =>
          option
            .setName('state')
            .setDescription('Activar o desactivar el sistema de niveles')
            .addChoices(
              { name: 'activar', value: 'on' },
              { name: 'desactivar', value: 'off' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('listlevelroles')
        .setDescription('Lista todos los roles de nivel para este servidor')
    ),
  async execute(interaction) {
    const guildData = await GuildSettings.findOne({
      guildId: interaction.guild.id,
    });
    const subcommand = interaction.options.getSubcommand();
    
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '¡No tienes el permiso de `Administrador` para gestionar niveles!',
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'addlevelrole': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }

        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        await LevelRoles.create({
          guildId: interaction.guild.id,
          level: level,
          roleId: role.id,
        });

        const embed = new EmbedBuilder()
          .setTitle('Rol de Nivel Añadido')
          .setDescription(
            `El rol **${role.name}** será otorgado en el nivel **${level}**.`
          )
          .setColor('Green');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'removelevelrole': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const level = interaction.options.getInteger('level');
        await LevelRoles.deleteOne({
          guildId: interaction.guild.id,
          level: level,
        });

        const embed = new EmbedBuilder()
          .setTitle('Rol de Nivel Eliminado')
          .setDescription(`El rol del nivel **${level}** ha sido eliminado.`)
          .setColor('Red');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'addlevel': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const user = interaction.options.getUser('user');
        const levelToAdd = interaction.options.getInteger('level');
        let memberData = await MemberData.findOne({
          guildId: interaction.guild.id,
          userId: user.id,
        });

        if (!memberData) {
          memberData = new MemberData({
            guildId: interaction.guild.id,
            userId: user.id,
            level: 1,
            xp: 0,
          });
        }
        memberData.level += levelToAdd;
        await memberData.save();

        const embed = new EmbedBuilder()
          .setTitle('Niveles Añadidos')
          .setDescription(
            `${user.username} ha recibido **${levelToAdd}** nivel(es).`
          )
          .setColor('Blue');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'setlevel': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const user = interaction.options.getUser('user');
        const newLevel = interaction.options.getInteger('level');
        let memberData = await MemberData.findOne({
          guildId: interaction.guild.id,
          userId: user.id,
        });

        if (!memberData) {
          memberData = new MemberData({
            guildId: interaction.guild.id,
            userId: user.id,
            level: newLevel,
            xp: 0,
          });
        } else {
          memberData.level = newLevel;
        }
        await memberData.save();

        const embed = new EmbedBuilder()
          .setTitle('Nivel Establecido')
          .setDescription(
            `El nivel de ${user.username} ha sido establecido a **${newLevel}**.`
          )
          .setColor('Yellow');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'removelevel': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const user = interaction.options.getUser('user');
        const levelToRemove = interaction.options.getInteger('level');
        let memberData = await MemberData.findOne({
          guildId: interaction.guild.id,
          userId: user.id,
        });

        if (!memberData || memberData.level <= 1) {
          return interaction.reply({
            content: `${user.username} no tiene suficientes niveles para quitar.`,
            ephemeral: true,
          });
        }
        memberData.level = Math.max(1, memberData.level - levelToRemove);
        await memberData.save();

        const embed = new EmbedBuilder()
          .setTitle('Niveles Removidos')
          .setDescription(
            `Se han quitado **${levelToRemove}** nivel(es) a ${user.username}.`
          )
          .setColor('Orange');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'setlevelupchannel': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const channel = interaction.options.getChannel('channel');
        await GuildSettings.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { levelUpChannelId: channel.id },
          { upsert: true }
        );

        const embed = new EmbedBuilder()
          .setTitle('Canal de Subida de Nivel Establecido')
          .setDescription(`Los anuncios de subida de nivel se enviarán a ${channel}.`)
          .setColor('Purple');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'setxprate': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        const rate = interaction.options.getNumber('rate');
        await GuildSettings.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { xpRate: rate },
          { upsert: true }
        );

        const embed = new EmbedBuilder()
          .setTitle('Tasa de XP Establecida')
          .setDescription(`La tasa de XP ha sido establecida a **${rate}**.`)
          .setColor('Aqua');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'toggle': {
        const state = interaction.options.getString('state');
        const isEnabled = state === 'on';
        await GuildSettings.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { levelingEnabled: isEnabled },
          { upsert: true }
        );

        const stateText = isEnabled ? 'activado' : 'desactivado';
        const embed = new EmbedBuilder()
          .setTitle('Sistema de Niveles Modificado')
          .setDescription(`El sistema de niveles ha sido **${stateText}**.`)
          .setColor(isEnabled ? 'Green' : 'Red');

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'listlevelroles': {
        if (!guildData.levelingEnabled) {
          return interaction.reply({
            content: 'El sistema de niveles no está habilitado en este servidor',
          });
        }
        if (!interaction.guild) {
          return interaction.reply({
            content: 'Este comando solo puede ser usado en un servidor.',
            ephemeral: true,
          });
        }

        const levelRoles = await LevelRoles.find({
          guildId: interaction.guild.id,
        });

        if (levelRoles.length === 0) {
          return interaction.reply({
            content: 'No se encontraron roles de nivel para este servidor.',
            ephemeral: true,
          });
        }

        const rolesList = levelRoles
          .map((role) => `Nivel ${role.level}: <@&${role.roleId}>`)
          .join('\n');

        await interaction.reply({
          content: `**Roles de Nivel para este servidor:**\n${rolesList}`,
          ephemeral: true,
        });
      }
    }
  },
};
