// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { io } from 'socket.io-client';
import Creature from './creature'
import { updateUsers, updateCreatures } from "../data/globalData";
import cnFragment from './shaders/cnFragment.glsl.js'
import gradientFragment from './shaders/gradient.glsl'
import HorizontalGradientFrag from "./shaders/horizontal.frag";
import vertex from "./shaders/vertex.glsl";
import { DWC_META } from "../../../shared-constants";
import UserBackground from "./Backgrounds/UserBackground";
import orangeGreen from "../../assets/bg2000ver.jpeg"
import horizontalGradient from "../../assets/horizontal1000.png";
import { map } from "./utils.js"

const WIDTH = window.GARDEN_WIDTH;
const HEIGHT = window.GARDEN_HEIGHT;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket, socketAuthenticated = false;
const port = window.location.hostname.includes('iptime') ? '1012' : '3000'
// const port = (window.location.hostname === 'localhost' ? '3000' : '1012') // change to local IP address to access via mobile
let currentGarden;
let onlineUsers = {};
let onlineCreatures = {};
let allCreatures = [];

let gardenContainer;
let allCreaturesContainer;
let tilesContainer = new PIXI.Graphics()
let arcShapeMask, gradientUniforms, gardenImg;


let isAppRunning = false

PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES , 16);

export async function renderCreature(app) {
  if(userToken) {
   socket = await io(`http://${window.location.hostname}:${port}`, {
     auth: { token: `Bearer ${userToken}` }
   })
  }

  socket.on('connect', () => {
    console.log('socket connect')
    socketAuthenticated = true;
  })
  
  socket.on('connect_error', (error) => {
    console.log('socket connect error', error)
  })
  
  // set and reset online users
  socket.on('usersUpdate', (users) => {
    // get single user's garden data
    for(let i = 0; i < users.length; i++) {
      if(users[i] && (users[i]._id === userId)) {
        currentGarden = users[i].gardenSection
      }
    }
    // get all online users
    console.log('Users update: ', users)
    onlineUsers = updateUsers(users)
    updateOnlineCreatures()
  })

  socket.on('creatures', (creatures) => {
    console.log('socket received creatures', creatures)
    allCreatures = creatures
    updateOnlineCreatures(creatures)

    if (!isAppRunning) {
      isAppRunning = true
      render(app)
    }
  })
  
  // updateOnlineCreatures()

  function updateOnlineCreatures(arr) {
    const creatures = arr || allCreatures
    const newCreatures = updateCreatures(creatures, onlineUsers)
    onlineCreatures = newCreatures
  }

  socket.on('creaturesUpdate', (creaturesToUpdate) => {
    // console.log('Creatures Update: ', creaturesToUpdate)

    if (!allCreaturesContainer) return

    for (const [key, value] of Object.entries(onlineCreatures)) {
      if (creaturesToUpdate[key]) {
        const creature = allCreaturesContainer.children.find(ele => ele.name === key)
        const newState = creaturesToUpdate[key]

        // Update the target for movement inside of the creature class
        creature?.updateState(newState)        
      }
    }
  })
}

function render(app) {
  // init webgl renderer
  // WIDTH/2, HEIGHT/2 is the center of html canvas in webgl context

  // Make a container for the entire app, and offset it by the garden coordinates.
  // Doing this means that we can work with the global coordinates 
  // as they come from the server everywhere else.
  gardenContainer = new PIXI.Graphics()
  gardenContainer.x = -currentGarden.x
  gardenContainer.y = -currentGarden.y  

  allCreaturesContainer = new PIXI.Container()
  gardenContainer.addChild(allCreaturesContainer)

  for (const [key, value] of Object.entries(onlineCreatures)) {
    const c = new Creature(value)
    allCreaturesContainer.addChild(c)
  }

  drawGradientBackground(app);

  app.stage.addChild(gardenContainer)  

  animate(app);
}

function drawTiles() {
  const tilesBackground = new UserBackground(currentGarden)
  window.DWCApp.stage.addChild(tilesBackground)  
}

// graident + mask + shader
function drawGradientBackground(app) {
  const W = 1000;
  const H = 1000;

  const gradientContainer = new PIXI.Container()

  // outline shape
  arcShapeMask = new PIXI.Graphics();
  arcShapeMask.beginFill(0xffffff)
  arcShapeMask.moveTo(0, 0)
  arcShapeMask.lineTo(1000, 0)
  arcShapeMask.lineTo(1000,1000)
  arcShapeMask.quadraticCurveTo(500, 500, 0, 0)
  arcShapeMask.endFill()
  app.stage.addChild(arcShapeMask);

  // version 1: uniforms for shader Sprite
  gradientUniforms = {
    u_time: 1.0,
    u_point1: [0.5, 0.0],
    u_radius1: 0.1,
    u_color1: [12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0],
    u_point2: [0.5, 1.0],
    u_radius2: 0.1,
    u_color2: [253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0],
    u_resolution: [W, H]
  }
  const gradientFilter = new PIXI.Filter(null, HorizontalGradientFrag, gradientUniforms);
  const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
  gradientSprite.width = W
  gradientSprite.height = H
  gradientSprite.filters = [gradientFilter]  
  gradientContainer.addChild(gradientSprite)

  // version2: image sprite
  gardenImg = new PIXI.Sprite.from(horizontalGradient);
  gardenImg.anchor.set(0.5, 0.5);
  // gradientContainer.addChild(gardenImg)

  app.stage.addChild(gradientContainer);

  gradientContainer.mask = arcShapeMask

}

var time = 0

function animate(app) {

  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => {

      time += delta

      let r = 50 + (Math.sin(time*0.01)) * 300
      const cpx1 = 1000 - (Math.SQRT2 / 2 * r)
      const cpy1 = Math.SQRT2 / 2 * r 

      arcShapeMask.clear();
      arcShapeMask.beginFill(0xffffff)
      arcShapeMask.moveTo(0, 0)
      arcShapeMask.lineTo(1000, 0)
      arcShapeMask.lineTo(1000,1000)
      arcShapeMask.quadraticCurveTo(cpx1, cpy1, 0, 0)
      arcShapeMask.endFill()

      // move image horizontally
      // gardenImg.position.y = Math.sin(time/100) * 2000;

      // variate shader uniforms
      gradientUniforms.u_time = time * 0.005;

      allCreaturesContainer.children.forEach(c => {
        if (c.tick) c.tick(delta)
        const currentPos = new PIXI.Point(map(c.x, 0, 2000, 0, window.innerHeight), map(c.y, 0, 2000, 0, window.innerHeight))
        // garden.containsPoint(currentPos) && console.log(true)
      })
    })
}

