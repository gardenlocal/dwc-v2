// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { io } from 'socket.io-client';
import Creature from './creature'
import { updateUsers, updateCreatures } from "../data/globalData";
import cnFragment from './shaders/cnFragment.glsl.js'
import vertex from "./shaders/vertex.glsl";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket, socketAuthenticated = false;
const port = (window.location.hostname === 'localhost' ? '3000' : '330') // change to local IP address to access via mobile
let currentGarden;
let onlineUsers = {};
let onlineCreatures = {};
let allCreatures = [];

let gardenContainer;
let allCreaturesContainer;

export async function renderCreature(app) {
  if(userToken) {
   socket = await io(`http://${window.location.hostname}:${port}`, {
     auth: { token: `Bearer ${userToken}` }
   })
  }

  await socket.on('connect', () => {
    console.log('socket connect')
    socketAuthenticated = true;
  })
  
  socket.on('connect_error', (error) => {
    console.log('socket connect error', error)
  })
  
  // set and reset online users
  await socket.on('usersUpdate', (users) => {
    // get single user's garden data
    for(let i = 0; i < users.length; i++) {
      if(users[i]._id === userId) {
        currentGarden = users[i].gardenSection
      }
    }
    // get all online users
    onlineUsers = updateUsers(users)
    updateOnlineCreatures()
  })

  await socket.on('creatures', (creatures) => {
    allCreatures = creatures
    updateOnlineCreatures(creatures)
  })
  
  updateOnlineCreatures()

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

  setTimeout(() => {
   if(Object.keys(onlineCreatures).length > 0){
    render(app)
   }
  }, 200);
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
  
  const uniforms = {
    // uSampler2: PIXI.Texture.from('examples/assets/bg_scene_rotate.jpg'),
    u_time: 1,
  };
  const cnShader = PIXI.Shader.from(vertex, cnFragment, uniforms);

  // TODO: reponsive to resize window
  const quad = new PIXI.Mesh(geometry, cnShader);
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

  app.stage.addChild(gardenContainer)

  animate(app);
}

function animate(app) {
  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => {
      allCreaturesContainer.children.forEach(c => {
        if (c.tick) c.tick(delta)
      })
    })
}

