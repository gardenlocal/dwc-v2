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
let myCreatures = {};
let graphics = []
let onlineUsers = []

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
    for(let i = 0; i < users.length; i++) {
      onlineUsers.push(users[i])
    }

    console.log(onlineUsers)
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
        const curr = creaturesToUpdate[key]
        value.movement = curr.movement  // update myCreatures data
        updateTarget(app, key)  // update graphic objects data
      }
    }
  })

  setTimeout(() => {
   if(Object.keys(myCreatures).length > 0){
    render(app)
   }
  }, 200);
}


function render(app) {

  for (const [key, value] of Object.entries(myCreatures)) {

    const { movement, appearance, _id, gardenSection } = value;
    const { fillColor, radius } = appearance;
    let { fromX, fromY, toX, toY, transitionDuration } = movement;

    const originX = 0, originY = 0              

    fromX = fromX / 10 + WIDTH/2 + originX
    fromY = fromY / 10 + HEIGHT/2 + originY
    toX = toX / 10 + WIDTH/2 + originX
    toY = toY / 10 + HEIGHT/2 + originY
    /*
    fromX = map(fromX, -1000, 1000, 0, WIDTH/10) + WIDTH/2 + originX
    fromY = map(fromY, -1000, 1000, 0, HEIGHT/10) + HEIGHT/2 + originY
    toX = map(toX, -1000, 1000, 0, WIDTH/10) + WIDTH/2 + originX
    toY = map(toY, -1000, 1000,  0, HEIGHT/10) + HEIGHT/2 + originY
    */

    const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    let circle = new Graphics();
    circle.name = _id;
    circle.target = { x: toX, y: toY }
    circle.gardenSection = gardenSection;
    circle.lineStyle(4, hex);
    circle.drawCircle(0, 0, radius/10);
    circle.x = fromX;
    circle.y = fromY;
    circle.vx = 0;
    circle.vy = 0;

    const destination = new Graphics();
    destination.beginFill(0xffffff)
    destination.drawCircle(toX, toY, 5);
    destination.endFill();
    
    graphics.push(circle);

    app.stage.addChild(circle);
    app.stage.addChild(destination);

  }
  animate(app);

}

function animate(app) {
  // gotta run app.ticker for every object, all at once
    app.ticker.add((delta) => { 
      for (let i = 0; i < graphics.length; i++) {
        const obj = graphics[i]
        const target = obj.target

        let lastStep = 0;
        let milliseconds = 0;
        milliseconds += delta;
        var elapsed = milliseconds - lastStep;
        lastStep = milliseconds;

        var data = distanceAndAngleBetweenTwoPoints(obj.x, obj.y, target.x, target.y)
        var velocity = data.distance / 0.1;
        var toTargetVector = new Vector(velocity, data.angle)
        var elapsedSeconds = elapsed / 1000;

        obj.x += (toTargetVector.magX * elapsedSeconds)
        obj.y += (toTargetVector.magY * elapsedSeconds)
      }
    })
}

function updateTarget(app, id) {
  const c = myCreatures[id]
  if(graphics.length > 0){
    const g = graphics.find(ele => ele.name === id)
  
    let { toX, toY } = c.movement;
    g.gardenSection = c.gardenSection;
    const originX = 0, originY = 0
    
    toX = toX / 10 + WIDTH/2 + originX
    toY = toY / 10 + HEIGHT/2 + originY

    //toX = map(toX, -1000, 1000, 0, WIDTH/10) + WIDTH/2 + originX
    //toY = map(toY, -1000, 1000, 0, HEIGHT/10) + HEIGHT/2 + originY
  
    g.target.x = toX
    g.target.y = toY
  
    const destination = new Graphics();
    destination.beginFill(0xffffff)
    destination.drawCircle(toX, toY, 5);
    destination.endFill();
    app.stage.addChild(destination);
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
