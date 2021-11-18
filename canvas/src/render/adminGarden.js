// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import UserGarden from "./userGarden";
import { sound } from '@pixi/sound';
// import DRY_LEAVES_SOUND from '../../assets/dry-leaves.mp3';
import { randomInRange } from "./utils";

const CULL_BOUNDS = 1100

export default class AdminGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden) {
    super()
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden

    this.drawBackgrounds()

  //   sound.add('gardenTapSound', {
  //     url: DRY_LEAVES_SOUND,
  //     preload: true,
  //     loop: false,
  // });
  }

  drawBackgrounds() {
    let currentUser = Object.values(this.users).filter(u => u.uid == window.UID)[0]

    Object.values(this.users).forEach(u => {
      if (!u.gardenSection) return

      if (!window.APP.getIsAdmin()) {
        let isWideScreen = (window.innerWidth > window.innerHeight)
        let dX = Math.abs(u.gardenSection.x - currentUser.gardenSection.x)
        let dY = Math.abs(u.gardenSection.y - currentUser.gardenSection.y)
        let dOne = (isWideScreen) ? (dX) : (dY)
        let dZero = (isWideScreen) ? (dY) : (dX)          
        if (dOne > CULL_BOUNDS || dZero > (CULL_BOUNDS - 1000)) {
          return
        }
      }
      
      const garden = new UserGarden(this.users, this.creatures, u.gardenSection, u.uid)
      garden.x = u.gardenSection.x
      garden.y = u.gardenSection.y
      this.addChild(garden)

      console.log("window.IS_ADMIN: ", window.IS_ADMIN)
      if(window.SCREENREAD_MODE && !window.IS_ADMIN){
        this.createMoveButton()
    }

      if (u.uid == currentUser.uid) {        
        // This is the current user, we need to add an event listener for click
        garden.interactive = true
        garden.on('mousedown', this.onGardenTap)
        garden.on('touchstart', this.onGardenTap)
      }
    })
  }

// ACCESSIBILITY
  createMoveButton() {
    if(!document.getElementById('move')) {
      var accessButton = document.createElement("button");
      accessButton.id = "move"
      accessButton.ariaLabel = "크리쳐를 이동시킵니다."
      accessButton.innerText = "이동"

      accessButton.onclick = this.onGardenButtonClick

      var accessDiv = document.querySelector('.accessibility');
      accessDiv.appendChild(accessButton)
    }
}

  onGardenButtonClick = () => {
    window.SCREENREADER.textContent = "잊혀지지 않는 하나의 의미가 되고 싶다."

    let globalCoordinate = new PIXI.Point(randomInRange(0, window.innerWidth), randomInRange(100, window.innerHeight-100))
    let local = this.toLocal(globalCoordinate)
    console.log('--- local: ', local)
    window.APP.sendGardenTap(local)
    this.playSoundtrack()    
  }

  onGardenTap = (e) => {
    let local = this.toLocal(e.data.global)
    window.APP.sendGardenTap(local)
    this.playSoundtrack()    
  }

  playSoundtrack() {
    // if(!sound._sounds?.gardenTapSound?.isPlaying){ // if not playing
    //   sound.play('gardenTapSound')
    //   console.log("gardenTapSound: ", sound._sounds.gardenTapSound)
    // }
  }

  updateOnlineUsers(onlineUsers) {
    let currentUser = Object.values(this.users).filter(u => u.uid == window.UID)[0]

    // First, remove creatures that aren't online anymore
    let tilesToRemove = []
    let existingUsers = {}
    for (let c of this.children) {
      if (!onlineUsers[c.uid]) tilesToRemove.push(c)
      existingUsers[c.uid] = c
    }
    for (let c of tilesToRemove) {
      this.removeChild(c)
    }
    
    // Second, add creatures that don't exist
    for (let k of Object.keys(onlineUsers)) {
      if (!existingUsers[k]) {
        if (!window.APP.getIsAdmin()) {
          let u = onlineUsers[k]
          let isWideScreen = (window.innerWidth > window.innerHeight)
          let dX = Math.abs(u.gardenSection.x - currentUser.gardenSection.x)
          let dY = Math.abs(u.gardenSection.y - currentUser.gardenSection.y)
          let dOne = (isWideScreen) ? (dX) : (dY)
          let dZero = (isWideScreen) ? (dY) : (dX)          
          if (dOne > CULL_BOUNDS || dZero > (CULL_BOUNDS - 1000)) {
            continue
          }
        }  

        const garden = new UserGarden(this.users, this.creatures, onlineUsers[k].gardenSection, onlineUsers[k].uid)
        garden.x = onlineUsers[k].gardenSection.x
        garden.y = onlineUsers[k].gardenSection.y
        this.addChild(garden)  
      }
    }    
  }

  tick() {
    this.children.forEach(bg => {
      if(bg.tick) bg.tick()
    })
  }
}