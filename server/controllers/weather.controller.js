const weatherService = require("../service/weather.service");

exports.fetchLatest = async (req, res) => {
  try {
    let weather = await weatherService.fetchWeather();
    res.json({ data: (weather && weather.row) || null });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
