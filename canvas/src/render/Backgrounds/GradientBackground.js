import * as PIXI from 'pixi.js'
import vertex from "../shaders/vertex.glsl";
import gradientFragment from '../shaders/gradient.glsl'
import HorizontalGradientFrag from "../shaders/horizontal.frag";
import horizontalGradientImg from "../../../assets/horizontal1000.png";

export default class GradientBackground extends PIXI.Container {
  constructor(garden) {
    super()
    console.log('garden is: ', garden)

    let horizontalTiles = 1
    let tileWidth = window.GARDEN_WIDTH / horizontalTiles
    // let spriteScale = tileWidth / spriteSample.width
    // let tileHeight = spriteSample.height * spriteScale            
    // let verticalTiles = Math.ceil(window.GARDEN_HEIGHT / tileHeight)
    
    this.W = window.innerWidth > 1000 ? 1000: window.innerWidth;
    this.H = this.W;

    // outline shape
    this.arcShapeMask = new PIXI.Graphics();
    this.arcShapeMask.beginFill(0xffffff)
    this.arcShapeMask.moveTo(0, 0)
    this.arcShapeMask.lineTo(this.W, 0)
    this.arcShapeMask.lineTo(this.W, this.H)
    this.arcShapeMask.quadraticCurveTo(this.W, 300, 0, 0)
    this.arcShapeMask.endFill()

    // variables for arcShape
    this.r = 50;
    this.cpx1 = this.W - (Math.SQRT2 / 2 * this.r)
    this.cpy1 = Math.SQRT2 / 2 * this.r 
    this.time = 0;

    // version 1: uniforms for shader Sprite
    this.gradientUniforms = {
      u_time: 1.0,
      u_point1: [0.5, 0.0],
      u_radius1: 0.1,
      u_color1: [12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0],
      u_point2: [0.5, 1.0],
      u_radius2: 0.1,
      u_color2: [253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0],
      u_resolution: [this.W, this.H]
    }
    const gradientFilter = new PIXI.Filter(null, HorizontalGradientFrag, this.gradientUniforms);
    const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
    gradientSprite.width = this.W
    gradientSprite.height = this.H
    gradientSprite.filters = [gradientFilter]  
    this.addChild(gradientSprite)

    // version2: image sprite
    // this.gardenImg = new PIXI.Sprite.from(horizontalGradientImg);
    // this.gardenImg.anchor.set(0.5, 0.5);
    // this.addChild(this.gardenImg)

    this.mask = this.arcShapeMask

  }

  tick(t) {
   let delta = PIXI.Ticker.shared.elapsedMS
   this.time += delta/1000;

   this.gradientUniforms.u_time = Math.cos(this.time) * 0.7;
   
   this.r = 80 + (Math.sin(this.time)) * this.W/3;
   this.cpx1 = this.W - (Math.SQRT2 / 2 * this.r);
   this.cpy1 = Math.SQRT2 / 2 * this.r;

   this.arcShapeMask.clear();
   this.arcShapeMask.beginFill(0xffffff)
   this.arcShapeMask.moveTo(0, 0)
   this.arcShapeMask.lineTo(this.W, 0)
   this.arcShapeMask.lineTo(this.W, this.H)
   this.arcShapeMask.quadraticCurveTo(this.cpx1, this.cpy1 , 0, 0)
   this.arcShapeMask.endFill()

   // move image horizontally
   // this.gardenImg.position.y = Math.sin(this.time) * 2000;
  }
}