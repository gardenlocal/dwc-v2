// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import ResidueBackground from "./Backgrounds/ResidueBackground";
import axios from 'axios';
import { map } from "./utils";
import { update } from "@tweenjs/tween.js";
//import { SHAPES, TILE1, TILE2, TILE3, TILE4 } from "./Backgrounds/ResidueData.js";

const WEATHER_API = `http://dwc2-taeyoon-studio.iptime.org:1055/weather`
//const BG_DATA = [TILE1, TILE2, TILE3, TILE4]

export default class UserGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden, uid) {
    super()
    console.log('new user garden', users, selfGarden)
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden    
    this.uid = uid
    this.temperature = 5;
    this.humidity = 50;

    if (!this.userGarden) return

    this.bgAnimationParams = {
      currentTile: 0
    }

    this.init()
  }

  async init() {
    await this.fetchWeatherData()
    this.drawBackgrounds()

    window.setInterval(this.fetchWeatherData, 10000);
  }

  drawBackgrounds() {
    this.tilesContainer = new PIXI.Container()
    this.addChild(this.tilesContainer);

    for (let i = 0; i < this.userGarden.tileProps.length; i++) {
      const currentTile = this.userGarden.tileProps[i]
      const initLoop = currentTile[0]
      const { shaderTimeSeed, shaderSpeed } = this.userGarden.shaderProps
  
      const bg = new ResidueBackground(initLoop.shape, initLoop.anchor, shaderTimeSeed, shaderSpeed)
      this.tilesContainer.addChild(bg);
    }  
    
    this.animateBackgrounds()
  }

  async animateBackgrounds() {

    // params based on weather data
    const duration = map(this.temperature, -5, 20, 85000, 25000) // hotter, faster, shorter duration
    const shaderSpeed = map(this.humidity, 60, 80, 1, 0.1)  // more humid, faster    
    const targetSize = map(this.humidity, 40, 80, 0.25, 0.75)  // more humid, larger size
    console.log("HUMID ///////////////////", this.humidity, targetSize )

    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = this.userGarden.tileProps[i];
      const currentLoop = currentTile[this.bgAnimationParams.currentTile];
      const shaderRand = shaderSpeed * map(i, 0, 4, 5, 10)

      await this.tilesContainer.children[i].appear(targetSize, duration, currentLoop.shape, currentLoop.anchor, shaderRand) // appear at 0, disappear after bg2+bg3+bg4_duration
      if (i > 0) {
        // const currentTile = this.userGarden.tileProps[i - 1];
        // const currentLoop = currentTile[this.bgAnimationParams.currentTile];  
        await this.tilesContainer.children[i - 1].disappear(targetSize, duration) // appear at 0, disappear after bg2+bg3+bg4_duration  
      }
    }

    let i = this.tilesContainer.children.length - 1
    // const currentTile = this.userGarden.tileProps[i];
    // const currentLoop = currentTile[this.bgAnimationParams.currentTile];
    await this.tilesContainer.children[i].disappear(targetSize, duration) // appear at 0, disappear after bg2+bg3+bg4_duration  

    /*
    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = this.userGarden.tileProps[i]
      const currentLoop = currentTile[this.bgAnimationParams.currentTile]

      await this.tilesContainer.children[i].disappear(currentLoop.target, currentLoop.duration) // appear at 0, disappear after bg2+bg3+bg4_duration
    }
    */

    this.bgAnimationParams.currentTile = (this.bgAnimationParams.currentTile + 1) % this.userGarden.tileProps[0].length

    this.animateBackgrounds()
  }

  updateOnlineUsers(onlineUsers) {

  }

  async fetchWeatherData() {
    // Cezar: If the API call fails (happened to me, if the server is down or w/e),
    // The backgrounds don't get drawn because of an exception.
    // Please enclose this in a try/catch or make sure things still work if the API call
    // throws an exception.
    return
    const weather = 
      await axios.get(WEATHER_API)
        .catch(function (err) {
          if(err.response){
            console.log('Error with response: ', err.response.data)
            return
          } else if (err.request) {
            console.log('Error request: ', err.request)
            return
          } else {
            console.log('Error', error.message);
            return
          }
        })
        
    if (!weather) return

    const weatherData = weather.data;

    this.temperature = weatherData.temperature;
    this.humidity = weatherData.humidity;

    console.log("fetchWeatherData ///////////////////", weatherData)
    const timestamp = weatherData.timestamp;
    const unixTimeZero = Date.parse(timestamp) / 1000
    var date = new Date(unixTimeZero * 1000)
    // console.log(date, this.temperature, this.humidity)
  }

  tick() {
    this.tilesContainer?.children.forEach(bg => {
      if(bg.tick) bg.tick()
    })
  }
}