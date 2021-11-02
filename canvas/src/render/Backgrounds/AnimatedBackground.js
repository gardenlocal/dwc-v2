import * as PIXI from 'pixi.js';
import vertex from "../shaders/vertex.glsl";
import HorizontalGradientFrag from "../shaders/horizontal.frag";
import { distanceAndAngleBetweenTwoPoints, lerpPoint, randomElementFromArray, sleep } from "../utils.js";
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

export default class TransitionBackground extends PIXI.Graphics {
  constructor(currentShape, currentAnchor) {
    super()

    this.currentShape = currentShape
    this.currentAnchor = currentAnchor
    this.anchors = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]
    this.transitionAlpha = currentShape == SHAPES.CIRCLE ? 0.75 : 0.5

    this.W = window.GARDEN_WIDTH
    this.H = window.GARDEN_HEIGHT
    this.time = Math.random() * 10
    this.shaderSpeed = Math.random() * 10 + 1

    // Set up gradient
    const geometry = new PIXI.Geometry() 
    .addAttribute('aVertexPosition', [0, 0, this.W , 0, this.W , this.H, 0, this.H], 2) 
    .addAttribute('aUvs', [0,0,1,0,1,1,0,1], 2)
    .addIndex([0, 1, 2, 0, 2, 3]);
  
    this.gradientUniforms = {
        u_time: 1.0,
        u_point1: [0.5, 0.0], u_radius1: 0.1, u_color1: [12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0],
        u_point2: [0.5, 1.0], u_radius2: 0.1, u_color2: [253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0],
        u_resolution: [this.W, this.H]
    }
    const shader = PIXI.Shader.from(vertex, HorizontalGradientFrag, this.gradientUniforms);
    this.gradientBackground = new PIXI.Mesh(geometry, shader);
    this.addChild(this.gradientBackground)
  
    
    // Set up round shape
    this.setupCircle()

    // Set up triangle shape
    this.setupTriangle()

    // Set up clipping area
    this.clippingArea = new PIXI.Graphics()
    this.clippingArea.beginFill(0xffffff)
    this.clippingArea.drawRect(0, 0, this.W, this.H)  
    this.addChild(this.clippingArea)
    this.mask = this.clippingArea
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
    this.triangleTransition.rotation = this.anchors[this.currentAnchor]

    this.addChild(this.triangleTransitionContainer)
  }

  drawCircle() {
    if (this.currentShape != SHAPES.CIRCLE) {
      this.circleTransitionContainer.alpha = 0
      return
    }

    this.circleTransitionContainer.alpha = 1

    let bezierAlpha = this.transitionAlpha
    const WIDTH = this.W
    const HEIGHT = this.H
    this.circleTransition.clear()
    this.circleTransition.beginFill(0xf9f9f9)
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
    this.circleTransition.closePath()
  }

  drawTriangle() {
    if (this.currentShape != SHAPES.TRIANGLE) {
      this.triangleTransitionContainer.alpha = 0
      return
    }

    this.triangleTransitionContainer.alpha = 1

    let triangleAlpha = this.transitionAlpha

    this.triangleTransition.clear()
    this.triangleTransition.beginFill(0xf9f9f9)
    const midCoord = lerpPoint({ x: 0, y: 0 }, { x: this.W, y: this.H }, triangleAlpha)
    this.triangleTransition.drawPolygon([
      0, 0,
      this.W, 0,     
      midCoord.x, midCoord.y,  
      0, this.H,      
      0, 0
    ])

  }

  async animate(toShape, toAnchor, transitionType, duration) {
    const intermediateTransitionAlpha = transitionType == TRANSITION_TYPES.EMPTY ? 0 : 1    
    const nextTransitionAlpha = toShape == SHAPES.CIRCLE ? randomElementFromArray([0.75]) : randomElementFromArray([0.5])

    const d1 = Math.abs((intermediateTransitionAlpha - this.transitionAlpha) * duration / 2)

    const tween = new TWEEN.Tween(this)
    .to({ transitionAlpha: intermediateTransitionAlpha }, d1)
    .easing(TWEEN.Easing.Linear.None)
    //.easing(TWEEN.Easing.Quartic.InOut)
    .start()

    //await sleep(d1 - d1 / 8)
    await sleep(d1)
    
    this.currentShape = toShape
    this.circleTransition.rotation = this.anchors[toAnchor]
    this.triangleTransition.rotation = this.anchors[toAnchor]

    const d2 = Math.abs((nextTransitionAlpha - this.transitionAlpha) * duration / 2)

    const tween2 = new TWEEN.Tween(this)
    .to({ transitionAlpha: nextTransitionAlpha }, d2)
    //.easing(TWEEN.Easing.Quartic.InOut)
    .easing(TWEEN.Easing.Linear.None)
    .start()

    await sleep(d2)
  }

  tick(coord) {
    let delta = PIXI.Ticker.shared.elapsedMS
    this.time += delta/1000;
    const step = delta / (1000 * this.transitionDuration)
    this.triangleMovement += step
    this.radiusMovement += step/10

    // Shader background
    this.gradientUniforms.u_time = Math.cos(this.time / this.shaderSpeed) * 0.7;

    this.drawCircle()
    this.drawTriangle()
  }

}
