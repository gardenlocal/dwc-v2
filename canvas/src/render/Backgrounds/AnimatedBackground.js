import * as PIXI from 'pixi.js';
import vertex from "../shaders/vertex.glsl";
import HorizontalGradientFrag from "../shaders/horizontal.frag";
import { distanceAndAngleBetweenTwoPoints, lerpPoint, randomElementFromArray, sleep } from "../utils.js";
import TessGraphics from '../Geometry/TessGraphics';
import TWEEN from '@tweenjs/tween.js';

export default class TransitionBackground extends PIXI.Graphics {
  constructor(currentTile, currentAnchor) {
    super()

    this.currentTile = currentTile
    this.currentAnchor = currentAnchor
    this.anchors = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]
    this.transitionAlpha = 0.75

    this.W = window.GARDEN_WIDTH
    this.H = window.GARDEN_HEIGHT
    this.time = 0

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
    //this.drawCircle(this.transitionAlpha)

    // Set up triangle shape

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

  drawCircle() {
    let bezierAlpha = this.transitionAlpha
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
    this.circleTransition.closePath()
  }

  async animateCircle(toShape, toAnchor, transitionType, duration) {
    const intermediateTransitionAlpha = randomElementFromArray([0, 1])
    const nextTransitionAlpha = randomElementFromArray([0.75])

    const d1 = Math.abs((intermediateTransitionAlpha - this.transitionAlpha) * duration / 2)

    const tween = new TWEEN.Tween(this)
    .to({ transitionAlpha: intermediateTransitionAlpha }, d1)
    .easing(TWEEN.Easing.Linear.None)
    .start()

    console.log('tween is: ', tween)

    await sleep(d1)
    
    this.circleTransition.rotation = this.anchors[toAnchor]

    const d2 = Math.abs((nextTransitionAlpha - this.transitionAlpha) * duration / 2)

    const tween2 = new TWEEN.Tween(this)
    .to({ transitionAlpha: nextTransitionAlpha }, d2)
    .easing(TWEEN.Easing.Linear.None)
    .start()

    await sleep(d2)
  }

  drawTileTriangle(init) {
    switch(this.anchorIndex){
      case 0:
        this.polygon.drawPolygon([
          this.anchorArr[0].x, this.anchorArr[0].y,
          this.anchorArr[1].x, this.anchorArr[1].y, 
          init || this.center.x, init || this.center.y,
          this.anchorArr[2].x, this.anchorArr[2].y,
          this.anchorArr[0].x, this.anchorArr[0].y
        ])
        break;

      case 1:
        this.polygon.drawPolygon([
          this.anchorArr[1].x, this.anchorArr[1].y,
          this.anchorArr[0].x, this.anchorArr[0].y, 
          init || this.center.x, init || this.center.y,
          this.anchorArr[3].x, this.anchorArr[3].y,
          this.anchorArr[1].x, this.anchorArr[1].y
        ])
        break;

      case 2:
        this.polygon.drawPolygon([
          this.anchorArr[2].x, this.anchorArr[2].y,
          this.anchorArr[3].x, this.anchorArr[3].y, 
          init || this.center.x, init || this.center.y,
          this.anchorArr[0].x, this.anchorArr[0].y,
          this.anchorArr[2].x, this.anchorArr[2].y
        ])
        break;
          
      case 3:
        this.polygon.drawPolygon([
          this.anchorArr[3].x, this.anchorArr[3].y,
          this.anchorArr[2].x, this.anchorArr[2].y, 
          init || this.center.x, init || this.center.y,
          this.anchorArr[1].x, this.anchorArr[1].y,
          this.anchorArr[3].x, this.anchorArr[3].y
        ])
        break;
    }
  }

  animateTileTriangle(){
    // bug: this.triangleMovement is constantly 0;

    switch(this.transitionType) {
      
      case "TO_FULL" :
      switch(this.anchorIndex) {
          case 0:
            this.center.x -= this.triangleMovement;
            this.center.y -= this.triangleMovement;
            break;
          
          case 1:
            this.center.x += this.triangleMovement;
            this.center.y -= this.triangleMovement;
            break;

          case 2:
            this.center.x -= this.triangleMovement;
            this.center.y += this.triangleMovement;
            break;

          case 3:
            // console.log(this.center, this.triangleMovement)
            this.center.x += this.triangleMovement;
            this.center.y += this.triangleMovement;
            break;
        }
      break;

      case "TO_EMPTY":

        switch(this.anchorIndex) {
          case 0:
            // anchor1 - left top
            this.center.x += this.triangleMovement;
            this.center.y += this.triangleMovement;
            break;

          case 1:
            // anchor2 - right top
            this.center.x -= this.triangleMovement;
            this.center.y += this.triangleMovement;
            break;

          case 2:
            // anchor3 - left bottom
            this.center.x += this.triangleMovement;
            this.center.y -= this.triangleMovement;
            break;

          case 3:
            // anchor4 - right bottom
            this.center.x -= this.triangleMovement;
            this.center.y -= this.triangleMovement;
            break;
        }
      break;
    }
  }

  drawTileCircle(){
    this.polygon.drawCircle(
      this.anchorArr[this.anchorIndex].x,
      this.anchorArr[this.anchorIndex].y,
      this.radius,   
    );  
  }

  animateTileCircle(){
    switch(this.transitionType) {
      case "TO_FULL" :
        this.radius -= this.radiusMovement;
        break;
      case "TO_EMPTY":
        this.radius += this.radiusMovement; 
        break;
    }
  }

  tick(coord) {
    let delta = PIXI.Ticker.shared.elapsedMS
    this.time += delta/1000;
    const step = delta / (1000 * this.transitionDuration)
    this.triangleMovement += step
    this.radiusMovement += step/10

    // Shader background
    this.gradientUniforms.u_time = Math.cos(this.time) * 0.7;

    this.drawCircle()
    /*
    // White polygon
    this.polygon.clear();
    this.polygon.beginFill(0xffffff);

    this.checkState()

    switch(this.currentTile) {
      case "TRIANGLE":
        this.animateTileTriangle()
        this.drawTileTriangle();
       break;

      case "CIRCLE":
        this.animateTileCircle()
        this.drawTileCircle();
        break;
    }
    */

    // console.log(this.polygon.containsPoint(coord));
  }

}
