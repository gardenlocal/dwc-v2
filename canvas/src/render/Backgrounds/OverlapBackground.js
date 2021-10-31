import * as PIXI from 'pixi.js';
import vertex from "../shaders/vertex.glsl";
import HorizontalGradientFrag from "../shaders/horizontal.frag";

export default class OverlapBackground extends PIXI.Graphics {

  constructor(garden) {
    super()

    console.log('garden is: ', garden)
    this.W = window.innerWidth > 1000 ? 1000: window.innerWidth;
    this.H = this.W;
  
    // shader background fill the entire square
    const geometry = new PIXI.Geometry() 
      .addAttribute('aVertexPosition', // attribute name
        [0, 0, // x, y
        this.W , 0,
        this.W , this.H,
        0, this.H], 
      2) // size of the attribute
      .addAttribute('aUvs',
          [0,0,
          1,0,
          1,1,
          0,1],
      2)
      .addIndex([0, 1, 2, 0, 2, 3]);
    
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
    const shader = PIXI.Shader.from(vertex, HorizontalGradientFrag, this.gradientUniforms);
    const square = new PIXI.Mesh(geometry, shader);
    this.addChild(square)

    this.polygon = new PIXI.Graphics();
    this.r = 500;
    this.polygon.beginFill(0xffffff)
    // this.polygon.drawCircle(this.W, this.H, this.r)
    this.polygon.drawPolygon([ 0, 0, 100, 100, 100, 0, 0, 0])

    this.addChild(this.polygon);
    this.time = 0;
    this.diagonalLength = this.H * Math.SQRT2;
  }

  tick(coord) {
    let delta = PIXI.Ticker.shared.elapsedMS
    this.time += delta/1000;
    this.gradientUniforms.u_time = Math.cos(this.time) * 0.7;

    this.polygon.clear();
    this.polygon.beginFill(0xffffff);

    this.r = this.diagonalLength - Math.abs(Math.sin(this.time)*this.H/2.5);
    // this.polygon.drawCircle(this.W, this.H, this.r);
    this.polygon.drawPolygon([ 0, 0, 100, 100, this.r, 0, 0, 0])


    // console.log(this.polygon.containsPoint(coord));
  }

}
