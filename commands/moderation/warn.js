const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} = require('discord.js');
const { Types } = require('mongoose');

const warnings = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setName('warn')
    .setDescription('Advertir a un usuario o remover una advertencia')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Advertir a un usuario')
        .addUserOption((option) => {
          return option
            .setName('user')
            .setDescription('El usuario a advertir')
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName('reason')
            .setDescription('La razón para la advertencia')
            .setRequired(true)
            .setMaxLength(500);
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remover una advertencia de un usuario')
        .addStringOption((option) => {
          return option
            .setName('warn_id')
            .setDescription('El id de la advertencia a remover')
            .setRequired(true)
            .setMinLength(24)
            .setMaxLength(24);
        })
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'No tienes el permiso `KickMembers` para gestionar advertencias!',
        ephemeral: true,
      });
    }
    switch (interaction.options.getSubcommand()) {
      case 'add':
        {
          const { options, guild, member } = interaction;
          const user = options.getUser('user');
          const reason = options.getString('reason');
          const warnTime = time();

          const warnSchema = new warnings({
            _id: new Types.ObjectId(),
            guildId: guild.id,
            userId: user.id,
            warnReason: reason,
            moderator: member.user.id,
            warnDate: warnTime,
          });

          warnSchema.save().catch((error) => console.log(error));

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Miembro Advertido')
                .setDescription(`⚠️ <@${user.id}> ha sido advertido`)
                .addFields(
                  {
                    name: 'Razón',
                    value: `${reason}`,
                    inline: true,
                  },
                  {
                    name: 'Advertido por',
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                  }
                )
                .setTimestamp(),
            ],
          });

          user
            .send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`⚠️ Has sido advertido en: ${guild.name}`)
                  .addFields(
                    {
                      name: 'Razón',
                      value: `${reason}`,
                      inline: true,
                    },
                    {
                      name: 'Advertido por',
                      value: `<@${interaction.user.id}>`,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setColor(0xff0000),
              ],
            })
            .catch(async (error) => {
              console.log(error);
              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setTitle('❌ El usuario tiene los DMs deshabilitados así que no se envió ningún DM.')
                    .setColor(0xff0000),
                ],
              });
            });
        }
        break;

      case 'remove': {
        const guildId = interaction.guild.id;
        const warnId = interaction.options.getString('warn_id');

        const error = new EmbedBuilder()
          .setDescription(`No se encontró advertencia con ID \`${warnId}\`!`)
          .setColor(0xed4245);
        data = await warnings.findOne({ _id: warnId, guildId: guildId });
        if (!data) return await interaction.reply({ embeds: [error] });

        await warnings.deleteOne({ _id: warnId, guildId: guildId });

        const embed = new EmbedBuilder()
          .setTitle('Remover Infracción')
          .setDescription(
            `Se removió exitosamente la advertencia con el ID \`${warnId}\``
          )
          .setColor(5763719)
          .setTimestamp();
        return await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
