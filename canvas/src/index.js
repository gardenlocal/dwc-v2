// https://pixijs.io/guides/basics/getting-started.html
// https://www.html5gamedevs.com/topic/45444-unable-to-load-pixijs-as-a-module/
// https://codesandbox.io/s/app-architecture-3-t6cfv?file=/src/models.js
// https://github.com/pixijs/pixijs/pull/6415

import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import UserData from "./data/userData";
import { renderAdminCreatures } from "./render/adminGarden.js";
import { renderCreature } from "./render/userGarden";
import { loadAll } from './render/assetLoader';
import { renderCreatureTest } from "./render/creatureTest";
import { DWC_META } from "../../shared-constants";
import SVGCreatureShape from "./render/Geometry/SVGCreatureShape";
import { addStats, Stats } from 'pixi-stats';
import TWEEN from '@tweenjs/tween.js'

const LOGGEDIN = localStorage.getItem("user") ? true: false;

// alias
const Application = PIXI.Application,
  loader = PIXI.Loader.shared,
  resources = PIXI.Loader.shared.resources,
  Sprite = PIXI.Sprite;

const resizeTo = document.querySelector("#root");
const app = new Application({
  antialias: true,
  resolution: 1,
  resizeTo
});
resizeTo.appendChild(app.view)
//app.renderer.backgroundColor = 0x061639;
app.renderer.backgroundColor = 0xf9f9f9;


const ticker = PIXI.Ticker.shared

/*
const stats = addStats(document, app);
ticker.add(stats.update, stats, PIXI.UPDATE_PRIORITY.UTILITY)
*/

ticker.add(() => {
  TWEEN.update()
}, this, PIXI.UPDATE_PRIORITY.HIGH)

window.DWCApp = app
window.GARDEN_WIDTH = window.innerWidth > 1000 ? 1000 : window.innerHeight;
window.GARDEN_HEIGHT = window.GARDEN_WIDTH;

const startApp = async () => {
  // TODO: Depending on how many assets we end up having,
  // we can draw a loading screen here, and update the UI
  // with the progress coming from the loader.
  await loadAll((t) => {
    console.log('Loading progress: ', t.progress)
  })

  // Have all available creatures globally available, in order to be able to morph between them.
  window.DWCCreatureShapes = Object.keys(DWC_META.creatures).reduce((acc, k) => {
    const svgData = PIXI.Loader.shared.resources[DWC_META.creatures[k]].data
    acc[DWC_META.creatures[k]] = new SVGCreatureShape(svgData)
    return acc
  }, {})  

  console.log(window.DWCCreatureShapes)

  window.DWCApp.stage.scale.set(Math.min(window.innerWidth, window.innerHeight) / 1000)
  if (window.innerWidth < window.innerHeight)
    window.DWCApp.stage.pivot.set(0, (window.innerWidth - window.innerHeight))
  else
    window.DWCApp.stage.pivot.set((window.innerHeight - window.innerWidth), 0)

  if(LOGGEDIN && UserData.role === 'ROLE_ADMIN'){    
    renderAdminCreatures(app);
  } else if (LOGGEDIN && UserData.user.username == "cezar2") {
    renderCreatureTest(app)
  } else if (LOGGEDIN) {
    renderCreature(app)
  }
  
  app.resize();

}

startApp()