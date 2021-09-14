// https://medium.com/@edoueda/integrating-p5-js-and-webgl-with-react-js-96c848a63170

// import p from 'p';
import vert from './basic.vert';
import frag from './basic.frag';

export const sketch = (p) => {
  // globals.p = p
  let theShader;

  p.preload = () => {
    theShader = p.loadShader(vert, frag);
  }

  p.setup = () => {
    // p.createCanvas(window.innerWidth, window.innerHeight)
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL)
  }

  p.draw = () => {    
    p.background(240, 0, 232)
    p.shader(theShader);

    theShader.setUniform('mouseX', p.map(p.mouseX, 0, p.width, 0, 7.0));

    // rect gives us some geometry on the screen
    p.rect(0,0, 50, 50);
  }

  p.windowResized = () => {
    // p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.resizeCanvas(p.width, p.height)
  }
}