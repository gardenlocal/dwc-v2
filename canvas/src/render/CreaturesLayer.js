// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import Creature from './creature'

export default class CreaturesLayer extends PIXI.Container {
  constructor(users, creatures) {
    super()
    this.users = users
    this.creatures = creatures

    this.drawCreatures()
  }

  drawCreatures() {
    for (const [key, value] of Object.entries(this.creatures)) {
      const c = new Creature(value)
      this.addChild(c)
    }  
  }

  updateOnlineCreatures(onlineCreatures) {
    console.log('update online creatures: ', onlineCreatures)
    this.creatures = onlineCreatures

    // First, remove creatures that aren't online anymore
    let creaturesToRemove = []
    let existingCreatures = {}
    for (let c of this.children) {
      if (!onlineCreatures[c.name]) creaturesToRemove.push(c)
      existingCreatures[c.name] = c
    }
    for (let c of creaturesToRemove) {
      this.removeChild(c)
    }
    
    // Second, add creatures that don't exist
    for (let k of Object.keys(onlineCreatures)) {
      if (!existingCreatures[k]) {
        const c = new Creature(onlineCreatures[k])
        this.addChild(c)
      }
    }
  }

  updateCreatureData(creaturesToUpdate) {
    console.log('updateCreatureData', creaturesToUpdate)
    for (const [key, value] of Object.entries(this.creatures)) {
      if (creaturesToUpdate[key]) {
        const creature = this.children.find(ele => ele.name === key)
        const newState = creaturesToUpdate[key]

        // Update the target for movement inside of the creature class
        creature?.updateState(newState)        
      }
    }
  }

  evolveCreature(_id) {
      console.log('evolving creature ', _id)
      this.children.forEach(c => {
          if (c.name == _id) c.evolve()
      })
  }

  tick() {
    this.children.forEach(c => {
      if (c.tick) c.tick()
    })
  }
}
