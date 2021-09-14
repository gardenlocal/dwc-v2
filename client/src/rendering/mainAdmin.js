import Creature from './creature'
import { users, globalData, globals, creatures } from './globalData'

export const mainAdmin = (p5) => {
  globals.p5 = p5
  let creature
  let scaleFactor = 10
  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight)    
  }

  p5.draw = () => {    
    p5.background(240, 238, 232)
    p5.translate(window.innerWidth / 2 - 500 / scaleFactor, window.innerHeight / 2 - 500 / scaleFactor)
    p5.scale(1.0 / scaleFactor)    
    
    const { users } = globalData
    Object.values(users).forEach(u => {
      if (u.online) {
        p5.fill(22, 222, 22)
      } else {
        p5.fill('gray')
      }
      p5.rect(u.data.gardenSection.x, u.data.gardenSection.y, u.data.gardenSection.width, u.data.gardenSection.height)
      p5.fill('black')
      p5.textSize(7.5 * scaleFactor)
      p5.text(`${u.data.username}: (${u.data.gardenSection.x}, ${u.data.gardenSection.y})`, u.data.gardenSection.x + 2 * scaleFactor, u.data.gardenSection.y + 8 * scaleFactor)
    })

    Object.values(creatures).forEach(c => {
      c.draw()
    })
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
}