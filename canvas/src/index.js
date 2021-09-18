// https://pixijs.io/guides/basics/getting-started.html
// https://www.html5gamedevs.com/topic/45444-unable-to-load-pixijs-as-a-module/
// https://codesandbox.io/s/app-architecture-3-t6cfv?file=/src/models.js
// https://github.com/pixijs/pixijs/pull/6415

import * as PIXI from "pixi.js";
import cat1 from '../assets/cat1.jpg';
import cat2 from '../assets/cat2.jpg';
import cat3 from '../assets/cat3.jpg';

// alias
const Application = PIXI.Application,
  loader = PIXI.Loader.shared,
  resources = PIXI.Loader.shared.resources,
  Sprite = PIXI.Sprite;

const resizeTo = document.querySelector("#root");
console.log(resizeTo)
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application({
  antialias: true,
  resolution: 1,
  resizeTo
});
resizeTo.appendChild(app.view)
app.renderer.backgroundColor = 0x061639;
// The application will create a canvas element for you that you
// can then insert into the DOM

// load the texture we need
loader.onProgress.add(loadProgressHandler)
loader.add({
    name: 'kitty',
    url: cat1,
    onComplete: () => console.log('load complete'),
    crossOrigin:true
}).load(spriteSetup);
// loader.add('kitty', kitty).load(spriteSetup);

// let kitty;

function spriteSetup (loader, resources) {
  // This creates a texture from a 'kitty.png' image
  const kitty = new Sprite(resources.kitty.texture);
  // Setup the position of the kitty
  // kitty.x = app.renderer.width / 2;
  // kitty.y = app.renderer.height / 2;
  kitty.position.set(app.renderer.width/2, app.renderer.height/2);

  // Rotate around the center
  // kitty.anchor.x = 0.5;
  // kitty.anchor.y = 0.5;
  kitty.anchor.set(0.5, 0.5);
  kitty.scale.set(0.25, 0.25)

  // Add the kitty to the scene we are building
  app.stage.addChild(kitty);

  app.renderer.on('resize', (width, height) => {
    console.log('canvas resize');
    kitty?.position.set(width/2, height/2);
    kitty?.anchor.set(0.5, 0.5);
  });
  
  // Listen for frame updates
  app.ticker.add(() => {
       // each frame we spin the kitty around a bit
       kitty.rotation += 0.01;
  });
}

function loadProgressHandler(loader, resrc) {
  console.log("loading: " + resrc.url);
  console.log("progress: " + loader.progress + "%") 
}

window.onresize = function() {
    console.log('window resize')
}

app.resize();