// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { io } from 'socket.io-client';
import Creature from './creature'
import { updateUsers, updateCreatures } from "../data/globalData";
import UserData from "../data/userData";
import cnFragment from './shaders/cnFragment.glsl.js'
import gradientFragment from './shaders/gradient.glsl'
import { DWC_META } from "../../../shared-constants";
import UserBackground from "./Backgrounds/UserBackground";
import orangeGreen from "../../assets/bg2000ver.jpeg"
import horizontalGradient from "../../assets/horizontal1000.png";
import { map } from "./utils.js"
import GradientBackground from "./Backgrounds/GradientBackground";
import OverlapBackground from "./Backgrounds/OverlapBackground";

const WIDTH = window.GARDEN_WIDTH || 1000;
const HEIGHT = window.GARDEN_HEIGHT || 1000;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket, socketAuthenticated = false;
const port = window.location.hostname.includes('iptime') ? '1012' : '3000'
// const port = (window.location.hostname === 'localhost' ? '3000' : '1012') // change to local IP address to access via mobile
let currentGarden;
let onlineUsers = {};
let onlineCreatures = {};
let allCreatures = [];
let gardens = [];

let gardenContainer;
let allCreaturesContainer;

let allGardenSectionsContainer
let tilesContainer = new PIXI.Container();


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

  socket.on('creatures', async (creatures) => {
    console.log('socket received creatures', creatures)
    allCreatures = creatures
    updateOnlineCreatures(creatures)
    await setGardens()

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

async function setGardens() {
  const allUsers = (await UserData.getAdminData()).data
  gardens = []  // reset gardens data 
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


function render(app) {
  // init webgl renderer
  // WIDTH/2, HEIGHT/2 is the center of html canvas in webgl context

  app.ticker.add((delta) => {
    const currUserCreatureArr = getCurrentUserCreature()
    if (currUserCreatureArr.length == 0) return

    const creature = currUserCreatureArr[0]    
    //app.stage.pivot.set(creature.x - window.innerWidth / 1.5, creature.y - window.innerHeight / 1.2)
    //app.stage.rotation = -creature.creature.rotation
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


  allGardenSectionsContainer = new PIXI.Container()
  app.stage.addChild(allGardenSectionsContainer)
  allGardenSectionsContainer.position.set(-currentGarden.x, -currentGarden.y)  

  //drawTiles()

  //drawGradientBackground();
  //drawOverlapBackground();
  drawGarden()
  drawNeighborOverlays()

  app.stage.addChild(gardenContainer)
  animate(app);
}

function getCurrentUserCreature() {  
  return allCreaturesContainer.children.filter(c => {    
    return (c.ownerId == userId)
  })
}

// graident + mask + shader
function drawGradientBackground() {
  const gradientGarden = new GradientBackground(currentGarden);
  tilesContainer.addChild(gradientGarden);
  window.DWCApp.stage.addChild(tilesContainer);
}

function drawGarden() {
  const app = window.DWCApp;

  console.log('Draw garden: ', gardens)

  // Empty the container, then redraw. 
  while (allGardenSectionsContainer?.children[0]) { // null check
    allGardenSectionsContainer.removeChild(allGardenSectionsContainer.children[0])
  }  

  for (let i = 0; i < gardens.length; i++) {

    const g = gardens[i].garden;
    const isOnline = gardens[i].isOnline;

    const tilesBackground = new UserBackground(g)
    tilesBackground.x = g.x
    tilesBackground.y = g.y
    tilesBackground.width = g.width
    tilesBackground.height = g.height
    tilesBackground.alpha = 1//(isOnline ? 1 : 0.2)
    allGardenSectionsContainer.addChild(tilesBackground)    
    //window.DWCApp.stage.addChild(tilesBackground)    
  }
}

function drawNeighborOverlays() {
  const neighborsGrey = new PIXI.Graphics()
  neighborsGrey.beginFill(0x555555)
  neighborsGrey.alpha = 0.8
  neighborsGrey.drawRect(0, HEIGHT, WIDTH, HEIGHT)
  neighborsGrey.drawRect(0, -HEIGHT, WIDTH, HEIGHT)
  neighborsGrey.drawRect(-WIDTH, 0, WIDTH, HEIGHT)
  neighborsGrey.drawRect(WIDTH, 0, WIDTH, HEIGHT)
  neighborsGrey.endFill()
  window.DWCApp.stage.addChild(neighborsGrey)
}

function drawOverlapBackground() {
 
  // draw shapes on top of colored background
  const maskedBackground = new OverlapBackground(currentGarden);

  // tilesContainer.children[0].children[0] : ShaderMesh
  // tilesContainer.children[0].chilrend[1] : white polygon
  tilesContainer.addChild(maskedBackground);
  window.DWCApp.stage.addChild(tilesContainer);
}

var time = 0
const helper = new PIXI.Graphics();

function animate(app) {

  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => {

      time += delta

      allCreaturesContainer.children.forEach(c => {
        if (c.tick) c.tick(delta)
        // const currentPos = new PIXI.Point(map(c.x, 0, 2000, 0, window.innerHeight), map(c.y, 0, 2000, 0, window.innerHeight))
        // garden.containsPoint(currentPos) && console.log(true)
      })

      // helper
      const tempPos = new PIXI.Point(900, 900)
      helper.clear();
      helper.beginFill(0x000000);
      helper.drawCircle(tempPos.x, tempPos.y, 10)
      tilesContainer.addChild(helper);

      tilesContainer.children.forEach(bg => {
        if(bg.tick) bg.tick(tempPos);
      })
      
    })
}

