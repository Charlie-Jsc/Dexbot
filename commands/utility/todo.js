const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Todo = require('../../models/Todo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Gestionar tu lista de tareas.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Agregar una tarea a tu lista de tareas.')
        .addStringOption((option) =>
          option
            .setName('task')
            .setDescription('La tarea a agregar')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('priority')
            .setDescription('Establecer el nivel de prioridad: baja, media, alta')
            .setRequired(false)
            .addChoices(
              { name: 'Baja', value: 'low' },
              { name: 'Media', value: 'medium' },
              { name: 'Alta', value: 'high' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('view').setDescription('Ver tu lista de tareas.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Eliminar una tarea de tu lista de tareas.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('El número de tarea a eliminar')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete_all')
        .setDescription('Eliminar todas las tareas de tu lista de tareas.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('complete')
        .setDescription('Marcar una tarea como completada.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('El número de tarea a marcar como completada')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('priority')
        .setDescription('Cambiar la prioridad de una tarea.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('El número de tarea para cambiar prioridad')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('new_priority')
            .setDescription('Establecer el nuevo nivel de prioridad: baja, media, alta')
            .setRequired(true)
            .addChoices(
              { name: 'Baja', value: 'low' },
              { name: 'Media', value: 'medium' },
              { name: 'Alta', value: 'high' }
            )
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'add') {
      const task = interaction.options.getString('task');
      const priority = interaction.options.getString('priority') || 'medium';

      const newTodo = new Todo({
        userId,
        task,
        priority,
        dateAdded: new Date(),
      });

      await newTodo.save();

      const addEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📝 Tarea Agregada')
        .setDescription(
          `\`\`\`\nTarea: ${task}\nPrioridad: ${priority.toUpperCase()}\n\`\`\``
        )
        .addFields({
          name: 'Instrucciones',
          value: 'Usa `/todo view` para ver todas las tareas.',
        })
        .setFooter({ text: '¡Tarea agregada exitosamente!' })
        .setTimestamp();

      await interaction.reply({ embeds: [addEmbed], ephemeral: true });
    } else if (subcommand === 'view') {
      const todos = await Todo.find({ userId });

      if (todos.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🚫 No se Encontraron Tareas')
          .setDescription(
            'Tu lista de tareas está actualmente vacía.\nUsa `/todo add` para agregar una nueva tarea.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [emptyEmbed],
          ephemeral: true,
        });
      }

      const tasks = todos
        .map((todo, index) => {
          const timestamp = Math.floor(
            new Date(todo.dateAdded).getTime() / 1000
          );
          return `\`${index + 1}.\` **${todo.task}**\n    • Prioridad: \`${todo.priority.toUpperCase()}\`\n    • Completada: \`${todo.isCompleted ? '✅' : '❌'}\`\n    • Agregada el: <t:${timestamp}:F>`;
        })
        .join('\n\n');

      const viewEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📝 Tu Lista de Tareas')
        .setDescription(tasks)
        .setFooter({
          text: 'Usa /todo complete [número_tarea] para marcar una tarea como completada o /todo delete [número_tarea] para eliminarla.',
        })
        .setTimestamp();

      await interaction.reply({ embeds: [viewEmbed], ephemeral: true });
    } else if (subcommand === 'delete') {
      const taskNumber = interaction.options.getInteger('task_number') - 1;
      const todos = await Todo.find({ userId });

      if (taskNumber < 0 || taskNumber >= todos.length) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Número de Tarea Inválido')
          .setDescription(
            'El número de tarea especificado no existe. Por favor revisa tu lista e intenta de nuevo.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      const removedTask = todos[taskNumber];
      await Todo.deleteOne({ _id: removedTask._id });

      const deleteEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🗑️ Tarea Eliminada')
        .setDescription(`\`\`\`\nTarea Eliminada: ${removedTask.task}\n\`\`\``)
        .addFields({
          name: 'Nota',
          value: 'La tarea ha sido eliminada exitosamente de tu lista de tareas.',
        })
        .setTimestamp();

      await interaction.reply({ embeds: [deleteEmbed], ephemeral: true });
    } else if (subcommand === 'delete_all') {
      const deleted = await Todo.deleteMany({ userId });

      const deleteAllEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🗑️ Todas las Tareas Eliminadas')
        .setDescription(
          deleted.deletedCount > 0
            ? `Se eliminaron todas las ${deleted.deletedCount} tareas de tu lista de tareas.`
            : 'Tu lista de tareas ya estaba vacía.'
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [deleteAllEmbed],
        ephemeral: true,
      });
    } else if (subcommand === 'complete') {
      const taskNumber = interaction.options.getInteger('task_number') - 1;
      const todos = await Todo.find({ userId });

      if (taskNumber < 0 || taskNumber >= todos.length) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Número de Tarea Inválido')
          .setDescription(
            'El número de tarea especificado no existe. Por favor revisa tu lista e intenta de nuevo.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      const taskToComplete = todos[taskNumber];
      taskToComplete.isCompleted = true;
      await taskToComplete.save();

      const completeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Tarea Completada')
        .setDescription(
          `\`\`\`\nTarea Completada: ${taskToComplete.task}\n\`\`\``
        )
        .addFields({
          name: 'Estado',
          value: 'Esta tarea ha sido marcada como completada.',
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [completeEmbed],
        ephemeral: true,
      });
    } else if (subcommand === 'priority') {
      {
        const taskNumber = interaction.options.getInteger('task_number') - 1;
        const newPriority = interaction.options.getString('new_priority');
        const todos = await Todo.find({ userId });

        if (taskNumber < 0 || taskNumber >= todos.length) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Número de Tarea Inválido')
            .setDescription(
              'El número de tarea especificado no existe. Por favor revisa tu lista e intenta de nuevo.'
            )
            .setTimestamp();

          return await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }

        const taskToChange = todos[taskNumber];
        const oldPriority = taskToChange.priority;
        taskToChange.priority = newPriority;
        await taskToChange.save();

        const priorityChangeEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🔄 Prioridad Cambiada')
          .setDescription(
            `\`\`\`\nTarea: ${taskToChange.task}\nPrioridad Anterior: ${oldPriority.toUpperCase()}\nNueva Prioridad: ${newPriority.toUpperCase()}\n\`\`\``
          )
          .addFields(
            {
              name: 'Número de Tarea',
              value: `${taskNumber + 1}`,
              inline: true,
            },
            {
              name: 'Estado',
              value: '¡Nivel de prioridad actualizado exitosamente!',
              inline: true,
            }
          )
          .setFooter({
            text: 'Usa /todo view para ver la lista actualizada.',
          })
          .setTimestamp();

        await interaction.reply({
          embeds: [priorityChangeEmbed],
          ephemeral: true,
        });
      }
    }
  },
};
