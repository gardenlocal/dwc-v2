import Creature from './creature'

export const mainAdmin = (data) => (p5) => {
  let creature
  p5.setup = () => {
    console.log('P5 data: ', data)
    p5.createCanvas(window.innerWidth, window.innerHeight)
    // creature = new Creature(p5, { fromX: 200, fromY: 200, toX: 400, toY: 400, speed: 20, color: { r: 255, g: 204, b: 0 }, radius: 85 })
  }

  p5.draw = () => {
    p5.background(240, 238, 232)
    // p5.circle(100, 100, 100)
    // creature.draw()
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
}