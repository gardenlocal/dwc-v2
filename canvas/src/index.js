// https://pixijs.io/guides/basics/getting-started.html
// https://www.html5gamedevs.com/topic/45444-unable-to-load-pixijs-as-a-module/
// https://codesandbox.io/s/app-architecture-3-t6cfv?file=/src/models.js
// https://github.com/pixijs/pixijs/pull/6415

import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import { renderAdminCreatures } from "./render/adminGarden.js";
import UserGarden, { renderCreature } from "./render/userGarden";
import { loadAll } from './render/assetLoader';
import { renderCreatureTest } from "./render/creatureTest";
import { DWC_META } from "../../shared-constants";
import SVGCreatureShape from "./render/Geometry/SVGCreatureShape";
import { addStats, Stats } from 'pixi-stats';
import TWEEN from '@tweenjs/tween.js'

PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES , 16);

export default class PixiAppWrapper {
  constructor(options) {
    this.isAdmin = (options && options.isAdmin)

    this.setupPixiApp()
    this.setupStats()
    this.setupTween()
    this.resizeAppToWindow()

    this.setupLoadingScreen()
    //this.start()
  }

  setupPixiApp() {
    this.GARDEN_WIDTH = this.GARDEN_HEIGHT = window.GARDEN_WIDTH = window.GARDEN_HEIGHT = 1000

    this.pixiContainer = document.querySelector("#root")    
    this.pixiApp = new PIXI.Application({
      antialias: true,
      resolution: 1,
      resizeTo: this.pixiContainer
    })

    window.DWCApp = this.pixiApp

    this.pixiContainer.appendChild(this.pixiApp.view)
    this.pixiApp.renderer.backgroundColor = 0xf9f9f9;

    this.ticker = PIXI.Ticker.shared

    this.appContainer = new PIXI.Container()
    this.pixiApp.stage.addChild(this.appContainer)
    this.pixiApp.ticker.add(() => {
      this.tick()
    })
  }

  setupStats() {
    this.stats = addStats(document, this.pixiApp);
    this.ticker.add(this.stats.update, this.stats, PIXI.UPDATE_PRIORITY.UTILITY)
  }

  setupTween() {
    this.ticker.add(TWEEN.update, TWEEN, PIXI.UPDATE_PRIORITY.HIGH)
  }

  setupLoadingScreen() {
    this.isLoading = true
    this.loadingScreen = new PIXI.Container()
    this.loadingText = new PIXI.Text("Loading...", new PIXI.TextStyle({
      fontSize: 20,
      fill: "black",
    }))
    this.loadingScreen.addChild(this.loadingText)
    const bbox = this.loadingScreen.getBounds()
    this.loadingScreen.pivot.set(bbox.width, bbox.height)
    this.loadingScreen.position.set(this.GARDEN_WIDTH / 2, this.GARDEN_HEIGHT / 2)

    this.pixiApp.stage.addChild(this.loadingScreen)
  }

  async loadAssets() {
    await loadAll((t) => {
      console.log('Loading progress: ', t.progress)
    })

    // Have all available creatures globally available, in order to be able to morph between them.
    window.DWCCreatureShapes = Object.keys(DWC_META.creatures).reduce((acc, k) => {
      const svgData = PIXI.Loader.shared.resources[DWC_META.creatures[k]].data
      acc[DWC_META.creatures[k]] = new SVGCreatureShape(svgData)
      return acc
    }, {})
  }

  resizeAppToWindow() {
    const scale = Math.min(window.innerWidth, window.innerHeight) / 1000
    window.DWCApp.stage.scale.set(scale)
  
    if (window.innerWidth < window.innerHeight)
      window.DWCApp.stage.pivot.set(0, (-window.innerHeight / scale + window.GARDEN_HEIGHT) / 2)
    else
      window.DWCApp.stage.pivot.set((-window.innerWidth / scale + window.GARDEN_WIDTH) / 2, 0)    
  }

  render() {
    if (this.isAdmin) {
      //renderAdminCreatures(this.pixiApp)
    } else {
      this.garden = new UserGarden(window.APP.onlineUsers, window.APP.onlineCreatures, window.APP.selfGarden)
      this.pixiApp.stage.addChild(this.garden)
      //renderCreature(this.pixiApp)
    }

    this.pixiApp.resize()

    this.isLoading = false
    this.loadingScreen.alpha = 0
  }

  tick() {
    if (this.garden) {
      this.garden.tick()
    }
  }
}

/*


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

const stats = addStats(document, app);
ticker.add(stats.update, stats, PIXI.UPDATE_PRIORITY.UTILITY)

ticker.add(() => {
  TWEEN.update()
}, this, PIXI.UPDATE_PRIORITY.HIGH)

window.DWCApp = app
window.GARDEN_WIDTH = 1000
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

  console.log('Window dimensions: ', window.innerHeight, window.innerWidth)
  
  const scale = Math.min(window.innerWidth, window.innerHeight) / 1000
  window.DWCApp.stage.scale.set(scale)

  if (window.innerWidth < window.innerHeight)
    window.DWCApp.stage.pivot.set(0, (-window.innerHeight / scale + window.GARDEN_HEIGHT) / 2)
  else
    window.DWCApp.stage.pivot.set((-window.innerWidth / scale + window.GARDEN_WIDTH) / 2, 0)  

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

*/