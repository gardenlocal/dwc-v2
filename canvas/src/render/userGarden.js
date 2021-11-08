// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import ResidueBackground from "./Backgrounds/ResidueBackground";
//import { SHAPES, TILE1, TILE2, TILE3, TILE4 } from "./Backgrounds/ResidueData.js";

//const BG_DATA = [TILE1, TILE2, TILE3, TILE4]

export default class UserGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden, uid) {
    super()
    console.log('new user garden', users, selfGarden)
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden    
    this.uid = uid

    if (!this.userGarden) return

    this.bgAnimationParams = {
      currentTile: 0
    }

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
    for(let i = 0; i < this.tilesContainer.children.length; i++) {
      const currentTile = this.userGarden.tileProps[i];
      const currentLoop = currentTile[this.bgAnimationParams.currentTile];

      await this.tilesContainer.children[i].appear(currentLoop.target, currentLoop.duration, currentLoop.shape, currentLoop.anchor) // appear at 0, disappear after bg2+bg3+bg4_duration
      if (i > 0) {
        const currentTile = this.userGarden.tileProps[i - 1];
        const currentLoop = currentTile[this.bgAnimationParams.currentTile];  
        await this.tilesContainer.children[i - 1].disappear(currentLoop.target, currentLoop.duration) // appear at 0, disappear after bg2+bg3+bg4_duration  
      }
    }

    let i = this.tilesContainer.children.length - 1
    const currentTile = this.userGarden.tileProps[i];
    const currentLoop = currentTile[this.bgAnimationParams.currentTile];
    await this.tilesContainer.children[i].disappear(currentLoop.target, currentLoop.duration) // appear at 0, disappear after bg2+bg3+bg4_duration  

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

  tick() {
    this.tilesContainer.children.forEach(bg => {
      if(bg.tick) bg.tick()
    })
  }
}