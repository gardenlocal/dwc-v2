require('dotenv').config()

const axios = require('axios')
const { getConfig } = require('./config.js')
const Datastore = require('nedb-promises')
const weatherDatabase = Datastore.create('storage/weather.db')

console.log('Successfully connected to weather database')
console.log('Config is: ', getConfig())

const WEATHER_API = "https://garden-local-dev.hoonyland.workers.dev/weather/latest"

// update 2022
const serverFetchWeatherData = async () => {
    let weather
    try {
      weather = await axios.get(WEATHER_API);
    } catch (error) {
      console.log("server Weather ERROR ------------ ", error);
      return new Promise((res, rej) => res())
    } finally {
      if (weather && weather.data) {
        const weatherData = weather.data;
        const { data } = weather
        return data;
      }  
    }
}
exports.fetchWeather = serverFetchWeatherData;

const fetchAndSaveWeatherData = async () => {
    let data = await serverFetchWeatherData();
    const toSave = {
        ...data,
        serverHumanTime: new Date().toString(),
        serverTimestamp: new Date().getTime()
    }
    await weatherDatabase.insert(toSave)
    weatherDatabase.persistence.compactDatafile()    
}

const startWeatherService = () => {
    //setInterval()    
    const config = getConfig()
    if (config.weatherFetchInterval < 0) {
        setInterval(() => {}, 100000)
    } else {
        setInterval(fetchAndSaveWeatherData, config.weatherFetchInterval)
    }    
}

startWeatherService()