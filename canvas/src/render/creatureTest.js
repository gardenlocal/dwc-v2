// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { io } from 'socket.io-client';
import Creature from './creature'
import { updateUsers, updateCreatures } from "../data/globalData";
import cnFragment from './shaders/cnFragment.glsl.js'
import gradientFragment from './shaders/gradient.glsl'
import vertex from "./shaders/vertex.glsl";
import { DWC_META } from "../../../shared-constants";
import UserBackground from "./Backgrounds/UserBackground";
import ComplexCreature from "./Creatures/ComplexCreature"

let gardenContainer;
let allCreaturesContainer;
let tilesContainer;


let isAppRunning = false

export async function renderCreatureTest(app) {
  console.log('render creature test')
  render(app)  
}

function render(app) {
  const WIDTH = window.GARDEN_WIDTH;
  const HEIGHT = window.GARDEN_HEIGHT;

  // init webgl renderer
  // WIDTH/2, HEIGHT/2 is the center of html canvas in webgl context
  const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', // the attribute name
        [-WIDTH/2, -HEIGHT/2, // x, y
          WIDTH/2, -HEIGHT/2, // x, y
          WIDTH/2, HEIGHT/2,
          -WIDTH/2, HEIGHT/2], // x, y
      2) // the size of the attribute
    .addAttribute('aUvs', // the attribute name
        [0, 0, // u, v
         1, 0, // u, v
         1, 1,
         0, 1], // u, v
      2) // the size of the attribute
    .addIndex([0, 1, 2, 0, 2, 3]);
  
  // (cezar): Example of a gradient shader, if we want to implement the designs.
  const gradientUniforms = {
    u_time: 1.0,
    u_point1: [0.0, 0.0], // first center of the radial gradient, coordinates go from (0, 0) to (1, 1)
    u_radius1: 0.1, // radius of first point of radial gradient
    u_color1: [0.6, 0.2, 0.3], // color of first point of radial gradient
    u_point2: [1.0, 1.0], // second center of the radial gradient, coordinates go from (0, 0) to (1, 1)
    u_radius2: 0.1, // radius of second point of radial gradient
    u_color2: [0.2, 0.5, 0.8], // color of second point of radial gradient
    u_resolution: [WIDTH * 1.0, HEIGHT * 1.0]
  }
  const gradientShader = PIXI.Shader.from(vertex, gradientFragment, gradientUniforms);
  const quad = new PIXI.Mesh(geometry, gradientShader);

  quad.position.set(WIDTH/2, HEIGHT/2);  
  quad.scale.set(1);
  app.stage.addChild(quad)
  app.ticker.add((delta) => {
    //quad.shader.uniforms.u_time += Math.sin(delta/20);
  });

  // Make a container for the entire app, and offset it by the garden coordinates.
  // Doing this means that we can work with the global coordinates 
  // as they come from the server everywhere else.
  gardenContainer = new PIXI.Graphics()
  gardenContainer.x = WIDTH / 2
  gardenContainer.y = HEIGHT / 2

  allCreaturesContainer = new PIXI.Container()
  gardenContainer.addChild(allCreaturesContainer)

  app.stage.addChild(gardenContainer)

  drawCreatures()

  //app.stage.addChild(gardenContainer)  

  animate(app);
}

function animate(app) {
  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => {

    })
}

function drawCreatures() {  
  const creature = new ComplexCreature(DWC_META.creaturesNew.moss["moss-element-1"].name)
  gardenContainer.addChild(creature)
}