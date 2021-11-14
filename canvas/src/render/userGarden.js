// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import ResidueBackground from "./Backgrounds/ResidueBackground";
import axios from 'axios';
import { map } from "./utils";
import { update } from "@tweenjs/tween.js";
//import { SHAPES, TILE1, TILE2, TILE3, TILE4 } from "./Backgrounds/ResidueData.js";
//const BG_DATA = [TILE1, TILE2, TILE3, TILE4]

export default class UserGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden, uid) {
    super()
    // console.log('new user garden', users, selfGarden)
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden    
    this.uid = uid

    if (!this.userGarden) return

    this.bgAnimationParams = {
      currentTile: 0
    }

    this.init()
  }

  async init() {
    this.drawBackgrounds()    
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
    const shaderSpeed = map(this.humidity, 40, 80, 1, 0.1)  // more humid, faster    
    const targetSize = map(this.humidity, 40, 80, 0.25, 0.75)  // more humid, larger size

    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = this.userGarden.tileProps[i];
      const currentLoop = currentTile[this.bgAnimationParams.currentTile];
      const shaderRand = shaderSpeed * map(i, 0, 4, 5, 10)

      await this.tilesContainer.children[i].appear(targetSize, duration, currentLoop.shape, currentLoop.anchor, shaderRand) // appear at 0, disappear after bg2+bg3+bg4_duration
      if (i > 0) {
        // const currentTile = this.userGarden.tileProps[i - 1];
        // const currentLoop = currentTile[this.bgAnimationParams.currentTile];  
        // await this.tilesContainer.children[i - 1].disappear(targetSize, duration) // appear at 0, disappear after bg2+bg3+bg4_duration  
      }
    }

    /*
    let i = this.tilesContainer.children.length - 1
    await this.tilesContainer.children[i].disappear(targetSize, duration) // appear at 0, disappear after bg2+bg3+bg4_duration  
    */

    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = this.userGarden.tileProps[i]
      const currentLoop = currentTile[this.bgAnimationParams.currentTile]

      await this.tilesContainer.children[i].disappear(currentLoop.target, currentLoop.duration) // appear at 0, disappear after bg2+bg3+bg4_duration
    }

    this.bgAnimationParams.currentTile = (this.bgAnimationParams.currentTile + 1) % this.userGarden.tileProps[0].length

    this.animateBackgrounds()
  }

  updateOnlineUsers(onlineUsers) {

  }

  get temperature() {
    return window.TEMPERATURE || 5
  }

  get humidity() {
    return window.HUMIDITY || 55
  }

  tick() {
    this.tilesContainer?.children.forEach(bg => {
      if(bg.tick) bg.tick()
    })
  }
}