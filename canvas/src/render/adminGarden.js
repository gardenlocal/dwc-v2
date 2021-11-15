// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import UserGarden from "./userGarden";
import { sound } from '@pixi/sound';
import DRY_LEAVES_SOUND from '../../assets/dry-leaves.mp3';

export default class AdminGarden extends PIXI.Container {
  constructor(users, creatures, selfGarden) {
    super()
    this.users = users
    this.creatures = creatures
    this.userGarden = selfGarden

    console.log('new admin garden: ', this.users)

    this.drawBackgrounds()

    sound.add('gardenTapSound', {
      url: DRY_LEAVES_SOUND,
      preload: true,
      loop: false,
  });
  }

  drawBackgrounds() {
    let currentUser = Object.values(this.users).filter(u => u.uid == window.UID)[0]

    Object.values(this.users).forEach(u => {
      if (!window.APP.getIsAdmin()) {
        if (Math.abs(u.gardenSection.x - currentUser.gardenSection.x) > 1100 || Math.abs(u.gardenSection.y - currentUser.gardenSection.y) > 1100) {
          return
        }
      }
      const garden = new UserGarden(this.users, this.creatures, u.gardenSection, u.uid)
      garden.x = u.gardenSection.x
      garden.y = u.gardenSection.y
      this.addChild(garden)

      if (u.uid == currentUser.uid) {        
        // This is the current user, we need to add an event listener for click
        garden.interactive = true
        garden.on('mousedown', this.onGardenTap)
        garden.on('touchstart', this.onGardenTap)
      }
    })
  }

  onGardenTap = (e) => {
    console.log('on garden tap: ', e.data.global)
    let local = this.toLocal(e.data.global)
    console.log('--- local: ', local)
    window.APP.sendGardenTap(local)
    this.playSoundtrack()    
  }

  playSoundtrack() {
    if(!sound._sounds?.gardenTapSound?.isPlaying){ // if not playing
      sound.play('gardenTapSound')
      console.log("gardenTapSound: ", sound._sounds.gardenTapSound)
    }
  }

  updateOnlineUsers(onlineUsers) {
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