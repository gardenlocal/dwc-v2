// https://pixijs.io/guides/basics/getting-started.html
// https://www.html5gamedevs.com/topic/45444-unable-to-load-pixijs-as-a-module/
// https://codesandbox.io/s/app-architecture-3-t6cfv?file=/src/models.js
// https://github.com/pixijs/pixijs/pull/6415

import * as PIXI from "pixi.js";
import { Graphics, TextStyle } from "pixi.js";
import cat1 from '../assets/cat1.jpg';
import cat2 from '../assets/cat2.jpg';
import cat3 from '../assets/cat3.jpg';
import UserData from "./data/userData";
import { renderAdminCreatures } from "./render/adminGarden.js";
import { renderCreature } from "./render/userGarden";
import { renderSVGTest } from "./render/svgTest";
import { loadAll, DWC_META } from './render/assetLoader';

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
app.renderer.backgroundColor = 0x061639;

window.DWCApp = app

const startApp = async () => {
  // TODO: Depending on how many assets we end up having,
  // we can draw a loading screen here, and update the UI
  // with the progress coming from the loader.
  await loadAll((t) => {
    console.log('Loading progress: ', t.progress)
  })  

  if(LOGGEDIN && UserData.role === 'ROLE_ADMIN'){    
    renderAdminCreatures(app);
  } else if (LOGGEDIN && UserData.user.username == "cezar2") {
    renderSVGTest(app);
  } else if (LOGGEDIN) {
    renderCreature(app)
  }
  
  app.resize();
  
  app.renderer.on('resize', (width, height) => {
    kitty?.position.set(width/2, height/2)
    kitty?.anchor.set(0.5, 0.5);
    for(let i = 0; i < app.stage.children.length; i++){
      const elem = app.stage.children[i]
    }
  });
}

startApp()