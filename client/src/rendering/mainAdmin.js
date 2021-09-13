import Creature from './creature'

const globalData = {}

export const mainAdmin = (p5) => {
  let creature
  let scaleFactor = 10
  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight)
    // creature = new Creature(p5, { fromX: 200, fromY: 200, toX: 400, toY: 400, speed: 20, color: { r: 255, g: 204, b: 0 }, radius: 85 })
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
    // if (globalData)
    // p5.circle(100, 100, 100)
    // creature.draw()
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
}

export const updateGlobalData = (data) => {
  Object.keys(data).forEach(k => {
    globalData[k] = data[k]
  })


  console.log('Global data is: ', globalData)
}