// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { Graphics, Sprite, TextStyle } from "pixi.js";
import { io } from 'socket.io-client';
import { distanceAndAngleBetweenTwoPoints, Vector, map, constrain } from "./utils";
import Creature from './creature'
import UserData from "../data/userData";
import grassImg from '../../assets/green1.jpg';
import { elemIndex } from "prelude-ls";
import { updateUsers, updateCreatures } from "../data/globalData";
import cnFragment from './shaders/cnFragment.glsl'
import vertex from "./shaders/vertex.glsl";
import impulseFragment from "./shaders/impulse.frag";
import quadBezierFragment from "./shaders/quadBezier.frag";

const textStyle = new PIXI.TextStyle({
  fontSize: 200,
  fill: "white",
  stroke: "white",
})

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket;
let socketAuthenticated = false;
const port = (window.location.hostname === 'localhost' ? '3000' : '330'); // change to local IP address to access via mobile
let onlineCreatures = {};
let onlineUsers = {};
let allCreatures = [];
let gardens = [];

let gardenContainer; 
let allGardenSectionsContainer;
let allCreaturesContainer = new PIXI.Container();
let globalScale = 0.1;

let isAppRunning = false

export async function renderAdminCreatures(app) {
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
    console.log('socket users update: ', users)
    onlineUsers = updateUsers(users)

    // update creature and garden rendering when online users change
    updateOnlineCreatures()
    !!allGardenSectionsContainer && updateGarden()
  })
  
  // get ALL creatures data
  socket.on('creatures', (creatures) => {
    allCreatures = creatures
    updateOnlineCreatures(creatures)

    if (!isAppRunning) {
      isAppRunning = true
      render(app)
    }
  })

  updateOnlineCreatures()

  function updateOnlineCreatures(arr) {
    const creatures = arr || allCreatures
    const newCreatures = updateCreatures(creatures, onlineUsers)
    onlineCreatures = newCreatures

    updateCreatureOnCanvas()
  }    

  socket.on('creaturesUpdate', (creaturesToUpdate) => {
    for (const [key, value] of Object.entries(onlineCreatures)) {
      if (creaturesToUpdate[key]) {
        const creature = allCreaturesContainer?.children.find(ele => ele.name === key)
        const newState = creaturesToUpdate[key]

        // Update the target for movement inside of the creature class
        creature.updateState(newState)        
      } 
    }
  })
}

// add or remove creature on Canvas
function updateCreatureOnCanvas() {
  let canvasCreatures = []
  allCreaturesContainer.children.forEach( c => canvasCreatures.push(c.name) )
  for (const [key, value] of Object.entries(onlineCreatures)) {
    // check if creature is already added
    if (!canvasCreatures.includes(key)) {
      const c = new Creature(value)
      allCreaturesContainer.addChild(c)
    }
  }
  // if canvasCreatures have creature that is NOT online, delete it from PIXI.CONTAINER
  for (let i = 0; i < canvasCreatures.length; i++) {
    const keyStr = canvasCreatures[i]
    if (!onlineCreatures[keyStr]){
      const dead = allCreaturesContainer.children.find(child => child.name === keyStr)
      allCreaturesContainer.removeChild(dead)
    }
  }
}

// update garden color based on user's online status
function updateGarden() {
  
  const currentGardens = allGardenSectionsContainer.children

  currentGardens.forEach(elem => {
    
    if (Object.keys(onlineUsers).includes(elem.name)) {  // garden is online
      elem.shader = PIXI.Shader.from(vertex, quadBezierFragment, { u_time: 1 });

    } else if (elem.name) {  // garden is offline
      elem.shader = PIXI.Shader.from(vertex, impulseFragment, { u_time: 1 });
    
    }
  })
}

async function render(app) {
  gardenContainer = new PIXI.Graphics()  

  // Instead of dividing coordinates by 10 and adding the offset, we create a container;
  // we set its position to the offset and scale it, and then we can work with global coordinates
  // in the other parts of rendering.
  gardenContainer.x = WIDTH / 2
  gardenContainer.y = HEIGHT / 2
  gardenContainer.scale.set(globalScale, globalScale)

  // Create garden grid and check isOnline
  allGardenSectionsContainer = new PIXI.Container()
  gardenContainer.addChild(allGardenSectionsContainer)
  
  setGardens()

  PIXI.Loader.shared
  .add(grassImg)
  .load(drawGarden)

  // Create the creatures that move around garden
  gardenContainer.addChild(allCreaturesContainer)
  
  updateCreatureOnCanvas()
  app.stage.addChild(gardenContainer)
  animate(app);

  window.addEventListener('wheel', (e) => {
    console.log('wheel', e.deltaY)
    if (e.deltaY < 0) { globalScale -= 0.025 } 
    else { globalScale += 0.025 }
    if (globalScale < 0.025) globalScale = 0.025

    gardenContainer.scale.set(globalScale, globalScale)
  })
}

async function setGardens() {
  const allUsers = (await UserData.getAdminData()).data
  for (let i = 0; i < allUsers.length; i++){
    const u = allUsers[i]
    let isOnline = false;
    if (Object.keys(onlineUsers).includes(u.username)) {
      isOnline = true;
    }
    const garden = { 'user': u.username, 'garden': u.gardenSection, 'isOnline': isOnline }
    gardens.push(garden)
  }
}

function drawGarden() {
  const app = window.DWCApp;

  for (let i = 0; i < gardens.length; i++) {

    const g = gardens[i].garden;
    const isOnline = gardens[i].isOnline;

    // sprite version
    const square = new PIXI.Sprite(PIXI.Loader.shared.resources[grassImg].texture);
    square.name = gardens[i].user
    square.x = g.x;
    square.y = g.y;
    square.width = g.width;
    square.height = g.width;

    !isOnline && (square.alpha = 0.3)
    allGardenSectionsContainer.addChild(square)

    // webgl shader
    // (cezar): It didn't seem to render on my computer, so I brought back the sprite version temporarily for development.
    // Feel free to uncomment once we figure out the issue.

    const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', // the attribute name
        [0, 0, // x, y
          g.width, 0, // x, y
          g.width, g.height,
          0, g.height], // x, y
      2) // the size of the attribute
    .addAttribute('aUvs', // the attribute name
        [0, 0, // u, v
            1, 0, // u, v
            1, 1,
            0, 1], // u, v
      2) // the size of the attribute
    .addIndex([0, 1, 2, 0, 2, 3]);
    const uniforms = {
      u_time: 1.0,
    };
    const frag = isOnline ? quadBezierFragment : impulseFragment;
    const shader = PIXI.Shader.from(vertex, frag, uniforms);
    const quad = new PIXI.Mesh(geometry, shader);
    
    quad.name = gardens[i].user
    quad.position.set(g.x, g.y);  
    quad.scale.set(1);
    allGardenSectionsContainer.addChild(quad);    
    
    app.ticker.add((delta) => {
      quad.shader.uniforms.u_time += Math.sin(delta/20);
    });

    const message = new PIXI.Text(gardens[i].user, textStyle);
    message.position.set(g.x + 50, g.y);
    allGardenSectionsContainer.addChild(message);
  }
}

function animate(app) {
  // gotta run app.ticker for every object, all at once
  app.ticker.add((delta) => {
    allCreaturesContainer.children.forEach(c => {
      if (c.tick) c.tick(delta)
    })
  })
}