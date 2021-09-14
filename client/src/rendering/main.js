import Creature from './creature'
import { users, globalData, globals, creatures } from './globalData'

export const main = (p5) => {
  globals.p5 = p5
  
  p5.setup = () => {
    // p5.createCanvas(window.innerWidth, window.innerHeight)
    p5.createCanvas(1000, 1000)
  }

  p5.draw = () => {    
    const { username, gardenSection } = globalData.currentUser

    p5.push()
    p5.background(240, 238, 232)
    p5.translate(-gardenSection.x, -gardenSection.y)

    Object.values(creatures).forEach(c => {
      c.draw()
    })

    p5.pop()

    p5.textSize(15)    
    p5.text(`${username}: (${gardenSection.x}, ${gardenSection.y})`, 25, 100)    
  }

  p5.windowResized = () => {
    // p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    p5.resizeCanvas(1000, 1000)
  }
}