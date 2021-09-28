// https://jsfiddle.net/jwcarroll/2r69j1ok/3/
// https://stackoverflow.com/questions/40472364/moving-object-from-a-to-b-smoothly-across-canvas

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
let myCreatures = [];

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
    console.log(creatures)
    for(let i = 0; i < creatures.length; i++) {
      if(creatures[i]._id === creatureId){
        myCreatures.push(creatures[i])
      }
    }
  })

  setTimeout(() => {
   if(myCreatures.length > 0){
    render(app, myCreatures)
   }
  }, 200);
}

function render(app, myCreatures) {

  for(let i = 0; i < myCreatures.length; i++){
    let lastStep = 0;
    let milliseconds = 0;
    let circle, movement;

    const myCreature = myCreatures[i]
    const r = myCreature.appearance.radius / 2;
    const col = myCreature.appearance.fillColor;

    movement = myCreature.movement
    let { fromX, fromY, toX, toY, transitionDuration } = movement;
    fromX = map(fromX, -1000, 1000, 0, WIDTH)
    fromY = map(fromY, -1000, 1000, 0, HEIGHT)
    toX = map(toX, -1000, 1000, 0, WIDTH)
    toY = map(toY, -1000, 1000, 0, WIDTH)
  
    const hex = PIXI.utils.rgb2hex([col.r, col.g, col.b])
    circle = new Graphics();
    circle.beginFill(hex);
    circle.drawCircle(0, 0, r/2);
    circle.endFill();
    circle.x = fromX;
    circle.y = fromY;
    circle.vx = 0;
    circle.vy = 0;

    const destination = new Graphics();
    destination.beginFill(0xffffff)
    destination.drawCircle(toX, toY, 5);
    destination.endFill();

    app.stage.addChild(circle);
    app.stage.addChild(destination);

    app.ticker.add((delta) => {
      milliseconds += delta;
      var elapsed = milliseconds - lastStep;
      lastStep = milliseconds;
    
      var data = distanceAndAngleBetweenTwoPoints(circle.x, circle.y, toX, toY)
      var velocity = data.distance / 0.1;
      var toTargetVector = new Vector(velocity, data.angle)
      var elapsedSeconds = elapsed / 1000;
    
      circle.x += (toTargetVector.magX * elapsedSeconds)
      circle.y += (toTargetVector.magY * elapsedSeconds)
    })
  }
}

function map(n, start1, stop1, start2, stop2) {
  const newVal = (n - start1) / (stop1-start1) * (stop2 - start2) + start2;
  if(start2 < stop2) {
    return constrain(newVal, start2, stop2)
  } else {
    return constrain(newVal, stop2, start2)
  }
  return newVal;
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low)
}

function Vector(mag, angle) {
  const angleRad = (angle * Math.PI) / 180;
  this.magX = mag * Math.cos(angleRad);
  this.magY = mag * Math.sin(angleRad);
}

function distanceAndAngleBetweenTwoPoints(x1, y1, x2, y2) {
  var x = x2 - x1,
    y = y2 - y1;

  return {
    // x^2 + y^2 = r^2
    distance: Math.sqrt(x * x + y * y),

    // convert from radians to degrees
    angle: Math.atan2(y, x) * 180 / Math.PI
  }
}
