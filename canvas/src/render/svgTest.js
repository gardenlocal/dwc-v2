import * as PIXI from "pixi.js";
import PixiSVG from '../svg-lib'
import { Graphics, TextStyle } from "pixi.js";
import UserData from "../data/userData";
import { DWC_META } from "../../../shared-constants";

//Paletted.registerPlugin(PIXI.Renderer);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const style = new PIXI.TextStyle({
  fontSize: 24,
  fill: "white",
  stroke: "white",
})

export function renderSVGTest(app) {
    const svgContainer = new PIXI.Container()
    const { resources } = app.loader
    const svgData = PIXI.Loader.shared.resources[DWC_META.creatures.CREATURE_4].data
    const svg = new PixiSVG(svgData, { unpackTree: true })

    const bounds = svg.getBounds()
    svg.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
    svg.position.set(500, 500)
    svgContainer.addChild(svg)    

    console.log('svg is: ', svg)

    app.stage.addChild(svgContainer)
}

async function drawAllGardens(app) {
}

