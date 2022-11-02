const axios = require("axios");

exports.fetchWeather = async () => {
  const WEATHER_API_HOST = process.env.WEATHER_API || "http://localhost:3000";
  try {
    const weather = await axios.get(WEATHER_API_HOST);
    return weather.data;
  } catch (error) {
    throw error;
  }
};
