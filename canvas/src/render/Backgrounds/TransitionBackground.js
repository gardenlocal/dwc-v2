import * as PIXI from 'pixi.js';
import vertex from "../shaders/vertex.glsl";
import HorizontalGradientFrag from "../shaders/horizontal.frag";
import { distanceAndAngleBetweenTwoPoints } from "../utils.js";


export default class TransitionBackground extends PIXI.Graphics {

  constructor(currentTile, initAnchorIndex, transitionType, transitionDuration) {
    super()

    this.W = window.GARDEN_WIDTH;
    this.H = this.W;
  
    this.currentTile = currentTile; // TRIANGLE, CIRCLE
    this.anchorIndex = initAnchorIndex;
    this.transitionType = transitionType; // TO_FULL, TO_EMPTY
    this.transitionDuration = transitionDuration;

    this.currentState = null;  // FULL or EMPTY
    this.anchorArr = [{x: 0, y:0}, {x: this.W, y: 0}, {x: 0, y: this.H}, {x: this.W, y: this.H}];
    this.anchorAcrossIndex = null;
    this.radius = this.W;

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
    this.polygon.beginFill(0xffffff)    
    this.center = { x: this.W / 2.0, y : this.H / 2.0 };
    this.time = 0;
    this.triangleMovement = 0;
    this.radiusMovement = 0;
    this.addChild(this.polygon);

    // init tile movement
    // start from center of the tile
    switch(this.currentTile) {
      case "TRIANGLE":
        this.drawTileTriangle(this.W / 2.0);
        break;
      case "CIRCLE":
        this.drawTileCircle();
        break;
    }
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

  // change, reset
  update(currState) {

    if (currState === "FULL") {  // currently tile is fully colored. 

      this.transitionType = "TO_EMPTY"; // going to empty 
      this.radius = 0;
      console.log("FULL TO EMPTY")

      // to empty: center starts from the anchor
      const randomIndex = Math.floor(Math.random() * this.anchorArr.length);
      this.anchorIndex = randomIndex;

      this.center.x = this.anchorArr[randomIndex].x;
      this.center.y = this.anchorArr[randomIndex].y;
      this.anchorAcrossIndex = null;

    } else if (currState === "EMPTY") {   // currently tile is empty (white)

      // BUG: this gets executed when it shouldn't
      console.log("EMPTY TO FULL")
      this.transitionType = "TO_FULL"; // going to full
      const randomIndex = Math.floor(Math.random() * this.anchorArr.length);
      this.anchorIndex = randomIndex;

      this.radius = this.W * 1.5;

      // to full: center starts from across the anchor
      this.anchorAcrossIndex = 3 - randomIndex;
      this.center.x = this.anchorArr[this.anchorAcrossIndex].x;
      this.center.y = this.anchorArr[this.anchorAcrossIndex].y;

    }

    // reset
    this.time = 0;
    this.radiusMovement = 0;
    this.triangleMovement = 0;    
    this.setNewTile();

    // console.log(this.anchorIndex, this.anchorArr[this.anchorIndex], this.center)

  }

  setNewTile() {
    const arr = ["TRIANGLE", "TRIANGLE"];  // test triangles
    const random = Math.floor(Math.random() * arr.length);
    this.currentTile = arr[random];

  }

  checkState() {
    if(this.currentTile === "CIRCLE"){
      
      if(this.radius > this.W * 2.0) {
        this.currentState = "EMPTY"
      } else if(this.radius < 0) {
        this.currentState = "FULL"
      } else {
        this.currentState = null
      }

    } else if (this.currentTile === "TRIANGLE") { // TRIANGLE

      // check diagonal length from anchor to moving center
      const dist = distanceAndAngleBetweenTwoPoints(
        this.anchorArr[this.anchorIndex].x, this.anchorArr[this.anchorIndex].y,
        this.center.x, this.center.y
      ).distance
      
      // const diffX = this.center.x - this.anchorArr[this.anchorIndex].x
      // const diffY = this.center.y - this.anchorArr[this.anchorIndex].y 
      // console.log(diffY, diffX)

      if(dist >= this.W*1.5) {
        // BUG: random repeat when it shouldn't
        this.currentState = "EMPTY"

      }  else if (!!this.anchorAcrossIndex && dist < 1) { // check if anchor and center are getting closer
        console.log(this.anchorAcrossIndex)
        console.log(this.anchorIndex)
        console.log(dist)
        this.currentState = "FULL"

      } else {
        this.currentState = null
      }
    }
    if(this.currentState) {

      this.update(this.currentState);
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

    // console.log(this.polygon.containsPoint(coord));
  }

}
