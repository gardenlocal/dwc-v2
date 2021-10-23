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
import grassTxt from "../../assets/green1.jpg"
import rainbow from "../../assets/gradientTest.jpg"
import rainbow2 from "../../assets/gradientTest2.jpg"
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
let gardenSprite, gardenArc;


let isAppRunning = false

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
  
  /*  
  // Example of voronoi cells
  const uniforms = {
    // uSampler2: PIXI.Texture.from('examples/assets/bg_scene_rotate.jpg'),
    u_time: 1,
  };
  const cnShader = PIXI.Shader.from(vertex, cnFragment, uniforms);
  const quad = new PIXI.Mesh(geometry, cnShader);
  */

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

  // TODO: reponsive to resize window    

  quad.position.set(WIDTH/2, HEIGHT/2);  
  quad.scale.set(1);

  app.stage.addChild(quad);

  app.ticker.add((delta) => {
    quad.shader.uniforms.u_time += Math.sin(delta/20);
  });

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

  // drawTiles()
  gardenSprite = drawGarden()
  tilesContainer.addChild(gardenSprite)
  window.DWCApp.stage.addChild(tilesContainer);

  gardenArc = drawArc(600, 400)
  tilesContainer.mask = gardenArc;

  app.stage.addChild(gardenContainer)  

  animate(app);
}

// test resize with one tile for one garden
function drawTile() {
  tilesContainer = new PIXI.Graphics()

  const img = PIXI.Loader.shared.resources[DWC_META.tiles.TILE_1].texture
  const sprite = PIXI.Sprite.from(img)
  
  sprite.scale.set(1)
  sprite.position.set(0, 0)
  sprite.height = window.innerHeight;
  sprite.width = window.innerWidth;
  tilesContainer.addChild(sprite)

  window.DWCApp.stage.addChild(tilesContainer)  

}

function drawGarden(x, y) {

  const gardenImg = new PIXI.Sprite.from(rainbow2);
  gardenImg.anchor.set(0.5);

  return gardenImg
}

function drawArc(x, y){
  const arcShape = new PIXI.Graphics();
  arcShape.beginFill(0xff3300)
  // arcShape.lineStyle(3, 0xfd880b, 1)
  arcShape.moveTo(600,0)
  arcShape.bezierCurveTo(x,y,300,800,20,800);
  arcShape.lineTo(0,1000)
  arcShape.lineTo(1000,1000)
  arcShape.endFill()

  return arcShape;
}
function drawTiles() {
  const tilesBackground = new UserBackground(currentGarden)
  window.DWCApp.stage.addChild(tilesBackground)  
}

var time = 0
function animate(app) {

  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => {

      time += delta

      gardenArc.clear();
      gardenArc.beginFill(0xff3300)
      gardenArc.moveTo(600,0)
      gardenArc.bezierCurveTo(Math.sin(time*0.005)*600, Math.cos(time*0.005)*600,300,800,0,1000);
      gardenArc.lineTo(0,1000)
      gardenArc.lineTo(1000,1000)
      gardenArc.endFill()

      gardenSprite.rotation += 0.01;

      allCreaturesContainer.children.forEach(c => {
        if (c.tick) c.tick(delta)
        const currentPos = new PIXI.Point(map(c.x, 0, 2000, 0, window.innerHeight), map(c.y, 0, 2000, 0, window.innerHeight))
        // garden.containsPoint(currentPos) && console.log(true)
      })
    })
}

