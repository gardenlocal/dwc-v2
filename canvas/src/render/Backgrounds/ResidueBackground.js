import * as PIXI from 'pixi.js';
import vertex from "../shaders/vertex.glsl";
import HorizontalGradientFrag from "../shaders/horizontal.frag";
import { distanceAndAngleBetweenTwoPoints, lerp, lerpPoint, randomElementFromArray, randomInRange, sleep } from "../utils.js";
import TessGraphics from '../Geometry/TessGraphics';
import TWEEN from '@tweenjs/tween.js';

export const SHAPES = {
  TRIANGLE: 'TRIANGLE',
  CIRCLE: 'CIRCLE'
}

export const TRANSITION_TYPES = {
  EMPTY: 'EMPTY',
  FULL: 'FULL'
}

export default class ResidueBackground extends PIXI.Container {
  constructor(currentShape, currentAnchor, shaderTimeSeed = 5, shaderSpeed = 5) {
    super()

    this.currentShape = currentShape
    this.currentAnchor = currentAnchor
    this.anchors = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]
    this.transitionAlpha = 0 // currentShape == SHAPES.CIRCLE ? 0.1 : 0.2

    this.W = window.GARDEN_WIDTH
    this.H = window.GARDEN_HEIGHT

    this.time = shaderTimeSeed
    this.shaderSpeed = shaderSpeed
    //this.time = Math.random() * 10
    //this.shaderSpeed = Math.random() * 10 + 1

    // for tess2
    /*
    this.clippingArea = new PIXI.Graphics()
    this.clippingArea.beginFill(0xffffff)
    this.clippingArea.drawRect(0, 0, this.W, this.H)  
    this.addChild(this.clippingArea)
    this.mask = this.clippingArea // replace mask with shader filter
    */
  
    this.s = window.DWCApp.stage.scale.y
    if (window.APP.getIsAdmin()) {
      this.s *= 0.2
    }

    this.gradientUniforms = {
        u_time: 1.0,
        u_point1: [0.5, 0.0], u_radius1: 0.1, u_color1: [12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0],
        u_point2: [0.5, 1.0], u_radius2: 0.1, u_color2: [253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0],
        u_offset: [0.0, - window.DWCApp.stage.pivot.y * this.s * 2],
        u_resolution: [this.W * 1.0, this.H * 1.0],
        u_scale: this.s * 1.0
    }

    this.timeOffset = 0.0
    if (window.APP.getIsAdmin()) {
    } else {
      let mod = (4 + ((window.APP.selfGarden.y) / 1000) % 4) % 4
      this.timeOffset = 2 * (mod % 2)
    }

    const gradientFilter = new PIXI.Filter(null, HorizontalGradientFrag, this.gradientUniforms);
    const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
    gradientSprite.width = this.W
    gradientSprite.height = this.H
    gradientSprite.filters = [gradientFilter]  
    this.addChild(gradientSprite)
    
    // Set up round shape
    this.setupCircle()

    // Set up triangle shape
    this.setupTriangle()

    this.isAnimating = false
    this.firstRenderCount = 0
  }

  setupCircle() {
    this.circleTransitionContainer = new PIXI.Container()
    this.circleTransition = new TessGraphics()
    
    this.circleTransitionContainer.addChild(this.circleTransition)    
  
    this.circleTransition.pivot.set(this.W / 2, this.H / 2)
    this.circleTransition.position.set(this.W / 2, this.H / 2)
    this.circleTransition.rotation = this.anchors[this.currentAnchor]

    this.addChild(this.circleTransitionContainer)
  }

  setupTriangle() {
    this.triangleTransitionContainer = new PIXI.Container()
    this.triangleTransition = new TessGraphics()
    
    this.triangleTransitionContainer.addChild(this.triangleTransition)    
  
    this.triangleTransition.pivot.set(this.W / 2, this.H / 2)
    this.triangleTransition.position.set(this.W / 2, this.H / 2)
    this.triangleTransition.rotation = this.anchors[this.currentAnchor] + Math.PI/2

    this.addChild(this.triangleTransitionContainer)
  }

  drawCircle() {
    if (this.currentShape != SHAPES.CIRCLE) {
      this.circleTransitionContainer.alpha = 0
      return
    }

    this.circleTransitionContainer.alpha = 1

    if (!this.isAnimating && this.firstRenderCount >= 2) return
    this.firstRenderCount++

    let bezierAlpha = this.transitionAlpha// + Math.cos(this.frame / 5) / 800
    const WIDTH = this.W
    const HEIGHT = this.H
    this.circleTransition.clear()
    this.circleTransition.beginFill(0xffffff)
    this.circleTransition.moveTo(0, 0)
    this.circleTransition.lineTo(WIDTH, 0)  
    this.circleTransition.lineTo(WIDTH, HEIGHT)

    const bezierMaxStretch = 0.35

    const pA0 = { x: WIDTH * (1 + bezierMaxStretch), y: 0 }
    const pB0 = { x: WIDTH, y: -HEIGHT * bezierMaxStretch }

    const pA1 = { x: 0, y: HEIGHT * (1 + bezierMaxStretch) }    
    const pB1 = { x: -WIDTH * bezierMaxStretch, y: HEIGHT }
  
    const pA = lerpPoint(pA0, pA1, bezierAlpha)
    const pB = lerpPoint(pB0, pB1, bezierAlpha)
    
    this.circleTransition.bezierCurveTo(pA.x, pA.y, pB.x, pB.y, 0, 0)
    this.circleTransition.closePath();

    this.mask = this.circleTransition;
  }

  drawTriangle() {
    if (this.currentShape != SHAPES.TRIANGLE) {
      this.triangleTransitionContainer.alpha = 0
      return
    }

    this.triangleTransitionContainer.alpha = 1

    if (!this.isAnimating && this.firstRenderCount >= 2) return
    this.firstRenderCount++

    let triangleAlpha = this.transitionAlpha //+ Math.cos(this.frame / 5) / 800

    this.triangleTransition.clear()
    this.triangleTransition.beginFill(0xffffff)
    const midCoord = lerpPoint({ x: 0, y: 0 }, { x: this.W, y: this.H }, triangleAlpha)
    this.triangleTransition.drawPolygon([
      0, 0,
      this.W, 0,     
      midCoord.x, midCoord.y,  
      0, this.H,      
      0, 0
    ])

    this.mask = this.triangleTransition;
  }

  async appear(target, duration, shape, anchor, shaderSpeed) {
    this.visible = true
    this.isAnimating = true

    this.currentShape = shape // randomElementFromArray(Object.values(SHAPES))

    // const newAnchorIndex = randomElementFromArray([0, 1, 2, 3]); 
    this.circleTransition.rotation = this.anchors[anchor]
    this.triangleTransition.rotation = this.anchors[anchor] // + Math.PI/2
    
    if(shaderSpeed) this.shaderSpeed = shaderSpeed 

    const transitionDuration = duration
    const intermediateTransitionAlpha = target  // appear up to target

    const d1 = Math.abs((intermediateTransitionAlpha) * transitionDuration / 2)

    const tween = new TWEEN.Tween(this)
    .to({ transitionAlpha: intermediateTransitionAlpha }, d1)
    .easing(TWEEN.Easing.Linear.None)
    // .easing(TWEEN.Easing.Quartic.InOut)
    .start()

    await sleep(d1)

    this.isAnimating = false
  }

  async disappear(target, duration) {
    this.isAnimating = true
    const intermediateTransitionAlpha = target  // disappear from target
    const d2 = Math.abs((intermediateTransitionAlpha) * duration / 2)

    const tween2 = new TWEEN.Tween(this)
    .to({ transitionAlpha: 0 }, d2)
    .easing(TWEEN.Easing.Linear.None)
    .start()

    await sleep(d2)
    this.isAnimating = false
    this.visible = false
  }

  tick(coord) {
    if (!this.frame) this.frame = 0
    this.frame++
    let delta = PIXI.Ticker.shared.elapsedMS
    this.time += delta / 1000
    let uTime = this.timeOffset + (this.time / this.shaderSpeed / 2.0) //((this.time + this.timeOffset) / this.shaderSpeed / 2.0)
    uTime %= 16

    // Shader background
    this.gradientUniforms.u_time = uTime

    this.drawCircle()
    this.drawTriangle()  
  }
}