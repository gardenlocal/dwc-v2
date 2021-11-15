// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import gradientFragment from './shaders/gradient.glsl'
import { DWC_META, generateLichen, generateMoss, generateMushroom } from "../../../shared-constants";
import MossCluster from "./Creatures/MossCluster"
import MushroomCluster from "./Creatures/MushroomCluster"
import LichenCluster from "./Creatures/LichenCluster"
import TWEEN from '@tweenjs/tween.js'

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

  drawMaskedGradient()
  drawMaskedGradient2()

  app.ticker.add((delta) => {
    TWEEN.update()
    allCreatures.forEach(c => c.tick())
  });
  

  // Make a container for the entire app, and offset it by the garden coordinates.
  // Doing this means that we can work with the global coordinates 
  // as they come from the server everywhere else.
  gardenContainer = new PIXI.Graphics()
  //gardenContainer.x = WIDTH / 2
  //gardenContainer.y = HEIGHT / 2

  allCreaturesContainer = new PIXI.Container()
  gardenContainer.addChild(allCreaturesContainer)

  //drawAllMoss(100)
  //drawMushrooms()
  //drawOneMoss()
  // drawOneMushroom()
  // setInterval(() => {
    drawOneLichen()
  // }, 1000)

  lichen.startAnimatingGrowth(1500)
  app.stage.addChild(gardenContainer)

}

let PADDING = 50
let currX = PADDING
let currY = PADDING
let maxY = 0

let lichen

function drawOneLichen() {
  if (lichen) {
    gardenContainer.removeChild(lichen)
  }
  const lichenProps = generateLichen()
  lichen = new LichenCluster(lichenProps)

  lichen.position.set(500, 500)

  gardenContainer.addChild(lichen)
  allCreatures.push(lichen)
}

function drawOneMushroom() {
  const mushroomProps = generateMushroom()
  const mushroom = new MushroomCluster(mushroomProps)  

  mushroom.position.set(500, 500)

  gardenContainer.addChild(mushroom)
  allCreatures.push(mushroom)

  mushroom.startAnimatingGrowth(1500)
}

async function drawOneMoss() {
  const mossProps = generateMoss()
  const moss = new MossCluster(mossProps)

  moss.position.set(500, 500)

  gardenContainer.addChild(moss)  
  allCreatures.push(moss)

  await moss.startAnimatingGrowth(1000, 400)
  await moss.evolve(600)
  return moss
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