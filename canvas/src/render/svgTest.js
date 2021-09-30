import * as PIXI from "pixi.js";
import PixiSVG from '../svg-lib'
import { Graphics, TextStyle } from "pixi.js";
import UserData from "../data/userData";

import svgTest from '../../assets/svg-test-1.svg';

//Paletted.registerPlugin(PIXI.Renderer);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const style = new PIXI.TextStyle({
  fontSize: 24,
  fill: "white",
  stroke: "white",
})

export function renderSVGTest(app) {
  // garden rectangle
  app.loader.add(svgTest).load((t) => {
    drawAllGardens(app)
  })    
}

async function drawAllGardens(app) {
    const rectangle = new PIXI.Graphics();
    const hex = PIXI.utils.rgb2hex([250, 40, 185])
    rectangle.lineStyle({width: 2, color: 0x00ff00, alpha: 0.5});
    rectangle.beginFill(hex);
    rectangle.drawRect(0, 0, 100, 100);
    rectangle.endFill();
    app.stage.addChild(rectangle);

    const svgContainer = new PIXI.Container()
    const { resources } = app.loader
    const svgData = Object.values(resources)[0].data
    const svg = new PixiSVG(svgData, { unpackTree: true })

    const bounds = svg.getBounds()
    svg.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
    svg.scale.set(0.1, 0.1)
    svg.position.set(200, 200)
    svgContainer.addChild(svg)    

    console.log('svg is: ', svg)

    app.stage.addChild(svgContainer)
}

