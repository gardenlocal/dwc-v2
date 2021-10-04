// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import { io } from 'socket.io-client';
import { distanceAndAngleBetweenTwoPoints, Vector, map, constrain } from "./utils";
import Creature from './creature'
import UserData from "../data/userData";

const style = new PIXI.TextStyle({
  fontSize: 200,
  fill: "white",
  stroke: "white",
})

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket, socketAuthenticated = false;
const port = (window.location.hostname === 'localhost' ? '3000' : '330') // change to local IP address to access via mobile
let myCreatures = {};
let graphics = []
let onlineUsers = [], onlineUsernames = []

let gardenContainer
let allCreaturesContainer
let allGardenSectionsContainer

let globalScale = 0.1


export async function renderAdminCreatures(app) {
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

  // get data of all online users
  await socket.on('usersUpdate', (users) => {
    console.log("users?", users)
    for(let i = 0; i < users.length; i++) {
      if(!users[i].isOnline) {   // remove ! later
        onlineUsers.push(users[i])
        onlineUsernames.push(users[i].username)
      }
    }
  })
  
  await socket.on('creatures', (creatures) => {
    for(let i = 0; i < creatures.length; i++) {
      for(let j = 0; j < onlineUsers.length; j++){
        const id = onlineUsers[j].creature
        if(creatures[i]._id === id){
          const creature = creatures[i]
          creature.gardenSection = onlineUsers[j].gardenSection
          myCreatures[id] = creature
        }
      }
    }

    console.log('creatures: ', myCreatures)
  })

  // constantly getting new data of current creatures
  socket.on('creaturesUpdate', (creaturesToUpdate) => {
    for (const [key, value] of Object.entries(myCreatures)) {
      if (creaturesToUpdate[key]) {
        const creature = allCreaturesContainer?.children.find(ele => ele.name === key)
        const newState = creaturesToUpdate[key]

        // Update the target for movement inside of the creature class
        creature.updateState(newState)        
      }
    }
  })

  setTimeout(() => {
   if(Object.keys(myCreatures).length > 0){
    render(app)
   }
  }, 200);
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

  const allUsers = (await UserData.getAdminData()).data
  let gardens = []
  for(let i = 0; i < allUsers.length; i++){
    const u = allUsers[i]
    let isOnline = false;
    if(onlineUsernames.includes(u.username)) {
      isOnline = true;
    }
    const garden = { 'user': u.username, 'garden': u.gardenSection, 'isOnline': isOnline }
    gardens.push(garden)
  }
  
  // draw gardens
  for(let i = 0; i < gardens.length; i++) {
    const isOnline = gardens[i].isOnline;
    const g = gardens[i].garden;
    const x = g.x;
    const y = g.y;
    const rectangle = new PIXI.Graphics();
    const hex = isOnline ? PIXI.utils.rgb2hex([0.1, 0.8, 0.4]) : PIXI.utils.rgb2hex([0.3, 0.3, 0.3])    
    rectangle.lineStyle({width: 20, color: 0x00ff00, alpha: 0.5});
    rectangle.beginFill(hex);
    rectangle.drawRect(x, y, g.width, g.width);
    rectangle.endFill();
    allGardenSectionsContainer.addChild(rectangle);

    const message = new PIXI.Text(gardens[i].user, style);
    message.position.set(x + 50, y);
    allGardenSectionsContainer.addChild(message);
  }

  // Create the creatures that move around garden
  allCreaturesContainer = new PIXI.Container()
  gardenContainer.addChild(allCreaturesContainer)

  for (const [key, value] of Object.entries(myCreatures)) {
    const c = new Creature(value)
    allCreaturesContainer.addChild(c)
  }

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

function animate(app) {
  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => { 
      allCreaturesContainer.children.forEach(c => {
        if (c.tick) c.tick(delta)
      })
    })
}