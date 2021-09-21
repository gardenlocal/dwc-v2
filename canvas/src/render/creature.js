import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import { io } from 'socket.io-client';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const userToken = JSON.parse(localStorage.getItem("user"))?.accessToken;
const userId = JSON.parse(localStorage.getItem("user"))?.id; 
let socket, socketAuthenticated = false;
const port = (window.location.hostname === 'localhost' ? '3000' : '330') // change to local IP address to access via mobile
let creatureId;
let myCreature;

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
  
  socket.on('usersUpdate', (users) => {
    for(let i = 0; i < users.length; i++) {
      if(users[i]._id === userId) {
        creatureId = users[i].creature;
      }
    }
  })
  
  await socket.on('creatures', (creatures) => {
    console.log(creatureId)
    for(let i = 0; i < creatures.length; i++) {
      if(creatures[i]._id === creatureId){
        myCreature = creatures[i]
      }
    }
    console.log(myCreature)
  })
  
  setTimeout(() => {
   if(myCreature){
    render(app, myCreature)
   }
  }, 100);
}

function render(app, myCreature) {
  console.log(myCreature)
  const r = myCreature.appearance.radius
  const col = myCreature.appearance.fillColor;
  const hex = PIXI.utils.rgb2hex([col.r, col.g, col.b])
  const circle = new Graphics();
  circle.beginFill(hex);
  circle.drawCircle(0, 0, r/2);
  circle.endFill();
  circle.x = 64;
  circle.y = 130;
  app.stage.addChild(circle);
}