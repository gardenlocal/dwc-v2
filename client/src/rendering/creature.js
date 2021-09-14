import p5 from 'p5'

export default class Creature {
  constructor(p5, state) {
    this.p5 = p5    
    this.lastDrawTime = -1
    this.directionChangeTimestamp = -1
    this.delta = 0
    this.position = this.p5.createVector(0, 0)    
    this.smoothFactor = 0.95
    this.updateState(state)
    this.smoothPosition = this.position.copy()
  }

  updateState(newState) {
    console.log('update state: ', newState)

    if (newState.movement.directionChangeTimestamp <= this.directionChangeTimestamp) {
      return
    }

    this.directionChangeTimestamp = newState.movement.directionChangeTimestamp

    this.state = newState
    this.id = newState._id
    this.from = this.p5.createVector(newState.movement.fromX, newState.movement.fromY)    
    this.to = this.p5.createVector(newState.movement.toX, newState.movement.toY)    

    this.transitionDuration = newState.movement.transitionDuration

    this.speed = this.from.dist(this.to) / this.transitionDuration

    this.color = newState.appearance.fillColor
    this.radius = newState.appearance.radius

    const now = new Date().getTime()
    const timeDelta = now - this.directionChangeTimestamp
    const pct = timeDelta / (this.transitionDuration * 1000)

    this.position = p5.Vector.add(this.from, p5.Vector.mult(p5.Vector.sub(this.to, this.from), pct))
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
    this.smoothPosition = p5.Vector.add(
      p5.Vector.mult(this.position, 1 - this.smoothFactor),
      p5.Vector.mult(this.smoothPosition, this.smoothFactor)
    )
    // console.log(this.direction)
    // console.log(this.direction.mult(this.delta * this.speed))
    // console.log(this.position.x, this.position.y, this.delta, this.speed)
  }

  draw() {
    this.p5.push()
    this.updateDelta()
    this.updatePosition()

    this.p5.fill(this.color.r, this.color.g, this.color.b)
    this.p5.noStroke()
    this.p5.circle(this.smoothPosition.x, this.smoothPosition.y, this.radius)
    this.p5.pop()
  }
}