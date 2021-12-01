// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import gradientFragment from './shaders/gradient.glsl'
import { DWC_META, generateLichen, generateMoss, generateMushroom } from "../../../shared-constants";
import MossCluster from "./Creatures/MossCluster"
import MushroomCluster from "./Creatures/MushroomCluster"
import LichenCluster from "./Creatures/LichenCluster"
import TWEEN from '@tweenjs/tween.js'
import { randomElementFromArray, sleep } from "./utils";

let gardenContainer;
let allCreaturesContainer;
let tilesContainer;
let allCreatures = []

let isAppRunning = false

export async function renderCreatureTest(app) {
  console.log('render creature test')
  render(app)  
}

let gridContainer

async function render(app) {
  const WIDTH = window.GARDEN_WIDTH;
  const HEIGHT = window.GARDEN_HEIGHT;  

  drawMaskedGradient()
  // drawMaskedGradient2()

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

  gridContainer = new PIXI.Container()  
  app.stage.addChild(gridContainer)
  startGrid([drawOneMoss, drawOneLichen, drawOneMushroom])
  // startGrid([drawOneMushroom])

  //drawAllMoss(100)
  // drawMushrooms()
  // let moss = drawOneMoss()
  // moss.startAnimatingGrowth(1000, 400)
  // const mushroom = drawOneMushroom()
  // mushroom.startAnimatingGrowth(1500)
  // setInterval(() => {
  // let l = drawOneLichen()
  // }, 1000)

  // l.startAnimatingGrowth(1500)
  app.stage.addChild(gardenContainer)

}

let cnt = 0

async function startGrid(elDrawFn) {
  await sleep(2000)
  const tween = new TWEEN.Tween(gardenContainer)
  .to({alpha: 0 }, 1000)
  .easing(TWEEN.Easing.Quartic.InOut)
  .start()

  const tween2 = new TWEEN.Tween(gridContainer)
  .to({alpha: 0 }, 1000)
  .easing(TWEEN.Easing.Quartic.InOut)
  .start()

  await sleep(1500)

  gardenContainer.removeChildren()
  gridContainer.removeChildren()
  allCreatures = []

  gardenContainer.alpha = 1
  gridContainer.alpha = 1

  await makeGrid(0, 0, 1000, 1000, 0, elDrawFn)
  await sleep(10000)
  startGrid(elDrawFn)
}

async function makeGrid(x, y, w, h, depth, elDrawFn) {
  const rect = new PIXI.Graphics()
  rect.lineStyle(2, 0xf0f0f0)
  rect.drawRect(x, y, w, h)  
  rect.alpha = 0
  gridContainer.addChild(rect)  
  if ((depth < 3 && Math.random() < 0.75) || (depth == 3 && Math.random() < 0.5)) {    
    await makeGrid(x, y, w / 2, h / 2, depth + 1, elDrawFn)
    await makeGrid(x, y + h / 2, w / 2, h / 2, depth + 1, elDrawFn)
    await makeGrid(x + w / 2, y + h / 2, w / 2, h / 2, depth + 1, elDrawFn)
    await makeGrid(x + w / 2, y, w / 2, h / 2, depth + 1, elDrawFn)
  } else {
    let scale = (depth < 4) ? (4 - depth) : 0.5

    let fn = (elDrawFn.length) ? randomElementFromArray(elDrawFn) : elDrawFn

    let l = fn(x + w / 2, y + h / 2, scale)
    l.startAnimatingGrowth(1500)
    const tween = new TWEEN.Tween(rect)
    .to({alpha: 1 }, 1000)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start()

    await sleep(500)
    // cnt += 200  
  }

}

let PADDING = 50
let currX = PADDING
let currY = PADDING
let maxY = 0

function drawOneLichen(x = 500, y = 500, scale = 1) {
  let lichen
  if (lichen) {
    //gardenContainer.removeChild(lichen)
  }
  const lichenProps = generateLichen()
  lichenProps.fillColor = 0xffffff
  lichen = new LichenCluster(lichenProps)

  lichen.position.set(x, y)
  lichen.scale.set(scale)

  gardenContainer.addChild(lichen)
  allCreatures.push(lichen)

  return lichen
}

function drawOneMushroom(x = 500, y = 500, scale = 1) {
  const mushroomProps = generateMushroom()
  mushroomProps.fillColor = 0xffffff
  const mushroom = new MushroomCluster(mushroomProps)  

  mushroom.position.set(x, y)
  mushroom.scale.set(scale)

  gardenContainer.addChild(mushroom)
  allCreatures.push(mushroom)  

  return mushroom
}

function drawOneMoss(x = 500, y = 500, scale = 1) {
  const mossProps = generateMoss()
  mossProps.fillColor = 0xffffff
  const moss = new MossCluster(mossProps)

  moss.position.set(x, y)
  moss.scale.set(scale * 0.4)

  gardenContainer.addChild(moss)  
  allCreatures.push(moss)

  //await moss.startAnimatingGrowth(1000, 400)
  // await moss.evolve(600)
  return moss
}

function drawMaskedGradient() {
  const W = 1000
  const H = 1000

  const whiteBg = new PIXI.Graphics()
  whiteBg.beginFill(0x000000)
  whiteBg.drawRect(0, 0, W, H)
  whiteBg.position.set(0, 0);
  window.DWCApp.stage.addChild(whiteBg)

  return
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
  // container.addChild(spriteMask)
  // container.mask = spriteMask

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