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
import Particle from "./Creatures/Particle"
import Cluster from "./Creatures/Cluster"
import { map, randomElementFromArray, randomIntInRange } from "./utils";

let gardenContainer;
let allCreaturesContainer;
let tilesContainer;
let allCreatures = []

let isAppRunning = false

export async function renderCreatureTest(app) {
  console.log('render creature test')
  render(app)  
}

async function render(app) {
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
    u_point1: [1.0, 0.0], // first center of the radial gradient, coordinates go from (0, 0) to (1, 1)
    u_radius1: 0.1, // radius of first point of radial gradient
    u_color1: [12.0 / 256, 239.0 / 256, 66.0 / 256],
    u_point2: [1.0, 1.0], // second center of the radial gradient, coordinates go from (0, 0) to (1, 1)
    u_radius2: 0.1, // radius of second point of radial gradient
    u_color2: [253.0 / 256, 136.0 / 256, 11.0 / 256],
    u_resolution: [WIDTH * 1.0, HEIGHT * 1.0]
  }
  const gradientShader = PIXI.Shader.from(vertex, gradientFragment, gradientUniforms);
  const quad = new PIXI.Mesh(geometry, gradientShader);
  quad.position.set(WIDTH/2, HEIGHT/2);  
  quad.scale.set(1);
  //app.stage.addChild(quad)
  drawMaskedGradient()
  drawMaskedGradient2()

  app.ticker.add((delta) => {
    //quad.shader.uniforms.u_time += Math.sin(delta/20);
    allCreatures.forEach(
      c => {
        c.tick()
        if (c.velocity) {
          c.rotation += c.velocity.r / 5
          c.position.x += c.velocity.x
          c.position.y += c.velocity.y
          if (c.position.x > 1500 || c.position.y > 1500 || c.position.x < -500 || c.position.y < -500) {
            gardenContainer.removeChild(c)
          }  
        }
      }
    )
  });
  

  // Make a container for the entire app, and offset it by the garden coordinates.
  // Doing this means that we can work with the global coordinates 
  // as they come from the server everywhere else.
  gardenContainer = new PIXI.Graphics()
  //gardenContainer.x = WIDTH / 2
  //gardenContainer.y = HEIGHT / 2

  allCreaturesContainer = new PIXI.Container()
  gardenContainer.addChild(allCreaturesContainer)

  app.stage.addChild(gardenContainer)

  for (let i = 0; i < 200; i++) {
    const c = drawOneCreature()
    c.rotation = Math.random() * Math.PI
    await new Promise((res, rej) => {
      c.startAnimatingGrowth(1000)
      setTimeout(() => {
        res()
      }, 500 * c.getNumberOfElements())
    })
  }

  /*
  for (let i = 0; i < 5; i++) {
    const c = drawNewCreature()
    await new Promise((res, rej) => {
      c.startAnimatingGrowth(800)
      setTimeout(() => {
        res()
      }, 111 * c.getNumberOfElements())
    })
  }
  */  

  // setInterval(() => {
  //   drawCreatures()
  // }, 1000)

}

let PADDING = 50
let currX = PADDING
let currY = PADDING
let maxY = 0

function drawOneCreature() {
  /*
  while (gardenContainer.children[0]) {
    gardenContainer.removeChild(gardenContainer.children[0])
  } 
  */   
  const creatureType = randomElementFromArray(['moss'])
  const noA = Object.keys(DWC_META.creaturesNew[creatureType]).length
  const cluster = new Cluster(creatureType, randomIntInRange(0, noA), randomIntInRange(0, noA))
  gardenContainer.addChild(cluster)
  //cluster.scale.set(map(Math.random(), 0, 1, 0.25, 1))
  cluster.position.set(map(Math.random(), 0, 1, 400, 600), map(Math.random(), 0, 1, 400, 600))
  cluster.velocity = {
    x: map(Math.random(), 0, 1, -1, 1),
    y: map(Math.random(), 0, 1, -1, 1),
    r: map(Math.random(), 0, 1, -0.01, 0.01)
  }
  allCreatures.push(cluster)
  return cluster
}

function drawNewCreature() {
  /*
  */ 

  //const creatureType = randomElementFromArray(['moss', 'lichen', 'mushroom'])
  const creatureType = randomElementFromArray(['moss'])
  const noA = Object.keys(DWC_META.creaturesNew[creatureType]).length
  const cluster = new Cluster(creatureType, randomIntInRange(0, noA), randomIntInRange(0, noA))
  gardenContainer.addChild(cluster)
  cluster.scale.set(1, 1)
  const bounds = cluster.getBounds()
  const s = 50 / bounds.height 

  if (currX + bounds.width * s + PADDING > window.GARDEN_WIDTH) {
    currY += maxY + PADDING
    currX = PADDING
    maxY = bounds.height * s

    if (currY + bounds.height * s + PADDING > window.GARDEN_HEIGHT) {
      currX = PADDING
      currY = PADDING
      while (gardenContainer.children[0]) {
        gardenContainer.removeChild(gardenContainer.children[0])
      }    
    }
  }  
  cluster.scale.set(s, s)
  cluster.position.set(currX + bounds.width * s / 2, currY + bounds.height * s / 2)
  currX += bounds.width * s + PADDING
  maxY = Math.max(bounds.height * s, maxY)

  allCreatures.push(cluster)
  return cluster
  //cluster.x = -bounds.width / 2
  //cluster.y = -bounds.height / 2  
  //creature.skew.x = -Math.PI / 8
}

function drawMaskedGradient() {
  const W = 1000
  const H = 1000

  const whiteBg = new PIXI.Graphics()
  whiteBg.beginFill(0xffffff)
  whiteBg.drawRect(0, 0, W, H)
  whiteBg.position.set(0, 0);
  window.DWCApp.stage.addChild(whiteBg)

  // First, we create the background gradient
  const gradientUniforms = {
    u_time: 1.0,
    u_point1: [0.0, 0.0],
    u_radius1: 0.1,
    u_color1: [12.0 / 256, 239.0 / 256, 66.0 / 256],
    u_point2: [1.0, 1.0],
    u_radius2: 0.1,
    u_color2: [253.0 / 256, 136.0 / 256, 11.0 / 256],
    u_resolution: [W, H]
  }

  // This is another way of applying a fragment shader: 
  // as a PIXI Filter, instead of going through a quad / Pixi Mesh / etc.
  const gradientFilter = new PIXI.Filter(null, gradientFragment, gradientUniforms);
  const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
  gradientSprite.width = W
  gradientSprite.height = H
  gradientSprite.filters = [gradientFilter]
  
  
  // Second, we create the background mask.
  // We simply draw a triangle.
  const shapeMask = new PIXI.Graphics()
  // It's important for the color of the mask to be white.
  shapeMask.beginFill(0xffffff)
  shapeMask.moveTo(0, 0)
  shapeMask.lineTo(W, 0)
  shapeMask.lineTo(W, H)
  shapeMask.closePath()

  // Third, we create a container for the final composition
  const container = new PIXI.Container()

  // We add the background shader as a child
  container.addChild(gradientSprite)

  // Then we add the shape mask as a child.
  // Working with a PIXI Graphics object as a mask is a little tricky, 
  // so we render it into a texture, create a sprite from that texture,
  // and use the sprite as a mask.
  var textureMask = window.DWCApp.renderer.generateTexture(shapeMask);
  var spriteMask = new PIXI.Sprite(textureMask)  
  container.addChild(spriteMask)
  container.mask = spriteMask

  window.DWCApp.stage.addChild(container)
}

function drawMaskedGradient2() {
  const W = 1000
  const H = 1000

  // First, we create the background gradient
  const gradientUniforms = {
    u_time: 1.0,
    u_point1: [0.0, 0.0],
    u_radius1: 0.1,
    //u_color1: [12.0 / 256, 239.0 / 256, 66.0 / 256],
    u_color1: [253.0 / 256, 136.0 / 256, 11.0 / 256],
    u_point2: [1.0, 1.0],
    u_radius2: 0.4,
    u_color2: [255.0 / 256, 255.0 / 256, 255.0 / 256],
    u_resolution: [W, H]
  }

  // This is another way of applying a fragment shader: 
  // as a PIXI Filter, instead of going through a quad / Pixi Mesh / etc.
  const gradientFilter = new PIXI.Filter(null, gradientFragment, gradientUniforms);
  const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
  gradientSprite.width = W
  gradientSprite.height = H
  gradientSprite.filters = [gradientFilter]
  
  
  // Second, we create the background mask.
  // We simply draw a triangle.
  const shapeMask = new PIXI.Graphics()
  // It's important for the color of the mask to be white.
  shapeMask.beginFill(0xffffff)
  shapeMask.moveTo(0, 0)
  shapeMask.lineTo(0, H)
  shapeMask.lineTo(W, H)
  shapeMask.closePath()

  // Third, we create a container for the final composition
  const container = new PIXI.Container()

  // We add the background shader as a child
  container.addChild(gradientSprite)

  // Then we add the shape mask as a child.
  // Working with a PIXI Graphics object as a mask is a little tricky, 
  // so we render it into a texture, create a sprite from that texture,
  // and use the sprite as a mask.
  var textureMask = window.DWCApp.renderer.generateTexture(shapeMask);
  var spriteMask = new PIXI.Sprite(textureMask)  
  container.addChild(spriteMask)
  container.mask = spriteMask

  window.DWCApp.stage.addChild(container)
}