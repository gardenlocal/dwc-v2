import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import UserData from "../data/userData";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const style = new PIXI.TextStyle({
  fontSize: 24,
  fill: "white",
  stroke: "white",
})

export function renderAdmin(app) {
  // garden rectangle
  let gardens = []
  async function drawAllGardens() {
    const allUsers = (await UserData.getAdminData()).data

    for(let i = 0; i < allUsers.length; i++){
      const u = allUsers[i]
      const garden = { 'user': u.username, 'garden': u.gardenSection }
      gardens.push(garden)
    }
  
    for(let i = 0; i < gardens.length; i++) {
      const g = gardens[i].garden
      const x = g.x/10 + WIDTH/2;
      const y = g.y/10 + HEIGHT/2;
      const rectangle = new PIXI.Graphics();
      const hex = PIXI.utils.rgb2hex([250, 40, 185])
      rectangle.lineStyle({width: 2, color: 0x00ff00, alpha: 0.5});
      rectangle.beginFill(hex);
      rectangle.drawRect(x, y, g.width/10, g.width/10);
      rectangle.endFill();
      app.stage.addChild(rectangle);
  
      const message = new PIXI.Text(gardens[i].user, style);
      message.position.set(x, y);
      app.stage.addChild(message);

      app.renderer.on('resize', (width, height) => {
        // console.log("garden", rectangle.position, g)
        // const originX = g.x/10 + width/2;
        // const originY = g.y/10 + height/2;
        // message.position.set(originX, originY);
        // rectangle.position.set(originX, originY);
      })
    }
  }
  drawAllGardens()
}
