require('dotenv').config()

const axios = require('axios')
const { getConfig } = require('./config.js')
const Datastore = require('nedb-promises')
const weatherDatabase = Datastore.create('storage/weather.db')

console.log('Successfully connected to weather database')
console.log('Config is: ', getConfig())

const fetchAndSaveWeatherData = async () => {
    let weather
    try {
      weather = await axios.get(process.env.WEATHER_API)
    //   console.log('weather: ', weather)
    } catch (error) {
    //   console.log("ERROR ------------ ", error)
      return new Promise((res, rej) => res())
    } finally {
      if (weather && weather.data) {
        const weatherData = weather.data;
        const { data } = weather
        const toSave = {
            ...data,
            serverHumanTime: new Date().toString(),
            serverTimestamp: new Date().getTime()
        }
        await weatherDatabase.insert(toSave)
        weatherDatabase.persistence.compactDatafile()    
      }  
    }
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