const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Obtener el clima actual de una ubicación.')
    .addStringOption((option) =>
      option
        .setName('location')
        .setDescription('La ubicación para obtener el clima')
        .setRequired(true)
    ),
  async execute(interaction) {
    const location = interaction.options.getString('location');

    const apiKey = process.env.WEATHER_API;

    if (!apiKey) {
      return await interaction.reply('La clave API del clima no está configurada.');
    }

    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`
    );

    if (!weatherResponse.ok) {
      return await interaction.reply(
        'No se pudo obtener el clima. Por favor revisa la ubicación e intenta de nuevo.'
      );
    }

    const data = await weatherResponse.json();

    if (data.error) {
      return await interaction.reply(
        'No se pudo encontrar ninguna ubicación con ese nombre. Por favor intenta con una diferente.'
      );
    }

    const weatherEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(
        `Clima Actual en ${data.location.name}, ${data.location.region}, ${data.location.country}`
      )
      .addFields(
        {
          name: 'Temperatura',
          value: `${data.current.temp_c}°C`,
          inline: true,
        },
        {
          name: 'Condition',
          value: `${data.current.condition.text}`,
          inline: true,
        },
        {
          name: 'Windspeed',
          value: `${data.current.wind_kph} kph`,
          inline: true,
        },
        {
          name: 'Humidity',
          value: `${data.current.humidity}%`,
          inline: true,
        },
        {
          name: 'Local Time',
          value: `${data.location.localtime}`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Weather data provided by WeatherAPI' });

    await interaction.reply({ embeds: [weatherEmbed] });
  },
};
