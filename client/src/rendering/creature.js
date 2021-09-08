import p5 from 'p5'

export default class Creature {
  constructor(p5, state) {
    this.p5 = p5
    this.updateState(state)
    this.lastDrawTime = -1
    this.delta = 0

    this.position = this.p5.createVector(0, 0)
  }

  updateState(newState) {
    this.state = newState
    this.id = newState.id
    this.from = this.p5.createVector(newState.fromX, newState.fromY)    
    this.to = this.p5.createVector(newState.toX, newState.toY)    

    this.speed = newState.speed
    this.color = newState.color
    this.radius = newState.radius

    this.position = this.from.copy()

    console.log(this.p5)
    this.direction = p5.Vector.sub(this.to, this.from).normalize()

    console.log(this.direction, this.from, this.to)
  }

  updateDelta() {
    const now = new Date().getTime()
    if (this.lastDrawTime < 0) {
      this.lastDrawTime = now
      this.delta = 0
    } else {
      this.delta = (now - this.lastDrawTime) / 1000
      this.lastDrawTime = now
    }
  }

  updatePosition() {
    this.position.add(p5.Vector.mult(this.direction, (this.delta * this.speed)))
    // console.log(this.direction)
    // console.log(this.direction.mult(this.delta * this.speed))
    // console.log(this.position.x, this.position.y, this.delta, this.speed)
  }

  draw() {
    this.updateDelta()
    this.updatePosition()

    this.p5.fill(this.color.r, this.color.g, this.color.b)
    this.p5.noStroke()
    this.p5.circle(this.position.x, this.position.y, this.radius)
  }
}