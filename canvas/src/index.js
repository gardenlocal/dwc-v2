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
import { renderAdmin } from "./render/adminGarden.js";

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

if(UserData.role === 'ROLE_ADMIN'){
  renderAdmin(app);
}

app.resize();

// load the texture we need
// loader.onProgress.add(loadProgressHandler)
loader.add({
  name: 'kitty',
  url: cat2,
  onComplete: () => console.log('kitty load complete'),
  crossOrigin:true
}).load(spriteSetup);

let kitty;

function spriteSetup (loader, resources) {
  kitty = new Sprite(resources.kitty.texture);
  // Setup the position of the kitty
  kitty.position.set(app.renderer.width/2, app.renderer.height/2);

  // Rotate around the center
  kitty.anchor.set(0.5, 0.5);
  kitty.scale.set(0.15, 0.15)

  // app.stage.addChild(kitty)

  // Listen for frame updates
  app.ticker.add(() => {
    kitty.rotation += 0.01;
  });
}

app.renderer.on('resize', (width, height) => {
  kitty?.position.set(width/2, height/2)
  kitty?.anchor.set(0.5, 0.5);
  for(let i = 0; i < app.stage.children.length; i++){
    const elem = app.stage.children[i]
  }
});