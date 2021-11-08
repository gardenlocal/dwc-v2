// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import Creature from './creature'
import ResidueBackground from "./Backgrounds/ResidueBackground";
import { SHAPES, TILE1, TILE2, TILE3, TILE4 } from "./Backgrounds/ResidueData.js";

const BG_DATA = [TILE1, TILE2, TILE3, TILE4]

export default class UserGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden) {
    super()
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden
    this.uid = this.userGarden.uid

    this.bgAnimationParams = {
      currentTile: 0
    }

    this.drawBackgrounds()
  }

  drawBackgrounds() {
    this.tilesContainer = new PIXI.Container()
    this.addChild(this.tilesContainer);

    for (let i = 0; i < BG_DATA.length; i++) {
      const currentTile = BG_DATA[i]
      const initLoop = currentTile[0]
  
      const bg = new ResidueBackground(initLoop.shape, initLoop.anchor)
      this.tilesContainer.addChild(bg);
    }  
    
    this.animateBackgrounds()
  }

  async animateBackgrounds() {
    console.log("start loop");

    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = BG_DATA[i];
      const currentLoop = currentTile[this.bgAnimationParams.currentTile];

      await this.tilesContainer.children[i].appear(currentLoop.target, currentLoop.duration, currentLoop.shape, currentLoop.anchor) // appear at 0, disappear after bg2+bg3+bg4_duration
    }

    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = BG_DATA[i]
      const currentLoop = currentTile[this.bgAnimationParams.currentTile]

      await this.tilesContainer.children[i].disappear(currentLoop.target, currentLoop.duration) // appear at 0, disappear after bg2+bg3+bg4_duration
    }

    console.log("end loop")
    this.bgAnimationParams.currentTile = (this.bgAnimationParams.currentTile + 1) % BG_DATA[0].length

    this.animateBackgrounds()
  }

  updateOnlineUsers(onlineUsers) {

  }

  tick() {
    this.tilesContainer.children.forEach(bg => {
      if(bg.tick) bg.tick()
    })
  }
}