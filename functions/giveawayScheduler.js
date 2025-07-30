const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function checkGiveaways(client) {
  try {
    const now = new Date();

    const endedGiveaways = await Giveaway.find({
      ongoing: true,
      endTime: { $lte: now },
    });

    for (const giveaway of endedGiveaways) {
      try {
        const guild = await client.guilds
          .fetch(giveaway.guildId)
          .catch(() => null);
        if (!guild) {
          giveaway.ongoing = false;
          await giveaway.save();
          continue;
        }

        const channel = await guild.channels
          .fetch(giveaway.channelId)
          .catch(() => null);
        if (!channel) {
          giveaway.ongoing = false;
          await giveaway.save();
          continue;
        }

        // Check channel permissions
        if (
          !channel
            .permissionsFor(guild.members.me)
            .has(['SendMessages', 'EmbedLinks'])
        ) {
          giveaway.ongoing = false;
          await giveaway.save();
          continue;
        }

        const message = await channel.messages
          .fetch(giveaway.messageId)
          .catch(() => null);
        if (!message) {
          giveaway.ongoing = false;
          await giveaway.save();
          continue;
        }

        // Filter out the host from participants
        const eligibleParticipants = giveaway.participants.filter(
          (participant) => participant !== giveaway.hostId
        );

        if (eligibleParticipants.length < giveaway.winners) {
          const embed = EmbedBuilder.from(message.embeds[0]);
          embed.setTitle('❌ Sorteo Cancelado ❌');
          embed.setDescription(
            `Premio: **${giveaway.prize}**\nEstado: **Cancelado - No hay suficientes participantes**\nParticipantes Requeridos: ${giveaway.winners}\nParticipantes Actuales: ${eligibleParticipants.length}`
          );
          embed.setColor('#FF0000');

          await message.edit({ embeds: [embed], components: [] });
          giveaway.ongoing = false;
          await giveaway.save();
          continue;
        }

        // Select winners without duplicates and excluding the host
        const winners = [];
        const participants = [...eligibleParticipants]; // Create a copy to avoid modifying the original array

        while (winners.length < giveaway.winners && participants.length > 0) {
          const randomIndex = Math.floor(Math.random() * participants.length);
          winners.push(participants.splice(randomIndex, 1)[0]);
        }

        giveaway.ongoing = false;
        await giveaway.save();

        const embed = EmbedBuilder.from(message.embeds[0]);
        embed.setTitle('🎉 Sorteo Terminado 🎉');
        embed.setDescription(
          `Premio: **${giveaway.prize}**\nGanadores: ${winners.map((w) => `<@${w}>`).join(', ')}\nOrganizado por: <@${giveaway.hostId}>\nParticipantes: ${eligibleParticipants.length}`
        );
        embed.setColor('#00FF00');

        await message.edit({ embeds: [embed], components: [] });

        await channel.send(
          `🎉 ¡Felicidades ${winners.map((w) => `<@${w}>`).join(', ')}! ¡Ganaste **${giveaway.prize}**! 🎉`
        );
      } catch (error) {
        console.error(`Error processing giveaway ${giveaway._id}:`, error);
        giveaway.ongoing = false;
        await giveaway.save();
      }
    }
  } catch (error) {
    console.error('Error in giveaway scheduler:', error);
  }
}

function startGiveawayScheduler(client) {
  // Check every 5 seconds instead of 10ms
  setInterval(() => checkGiveaways(client), 5000);
}

module.exports = startGiveawayScheduler;
