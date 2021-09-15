// https://medium.com/@edoueda/integrating-p5-js-and-webgl-with-react-js-96c848a63170

// import p from 'p';
// import vert from './metaball.vert';
// import frag from './metaball.frag';
import Metaball from './metaball.js';
// import { getShader } from './meta.glsl.js';
const N_balls = 10, metaballs = [];
const width = window.innerWidth, height = window.innerHeight;

export const sketch = (p) => {
  // globals.p = p
  let theShader;

  p.preload = () => {
  }

  p.setup = () => {
    // p.createCanvas(window.innerWidth, window.innerHeight)
    p.createCanvas(width, height, p.WEBGL);
    theShader = p.createShader(vert, frag);
    p.shader(theShader);

    for (let i = 0; i < N_balls; i++) {
      metaballs.push(new Metaball(p));
    }
  }

  p.draw = () => {    
    p.background(240, 0, 232)

    var data = [];
    for (const ball of metaballs) {
      ball.update();
      data.push(ball.pos.x, ball.pos.y, ball.radius);
    }

    theShader.setUniform("metaballs", data);
    p.rect(0, 0, p.width, p.height)
  }

  p.windowResized = () => {
    // p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.resizeCanvas(p.width, p.height)
  }
}

const vert = `
		attribute vec3 aPosition;
		attribute vec2 aTexCoord;

		varying vec2 vTexCoord;

		void main() {
			vTexCoord = aTexCoord;

			vec4 positionVec4 = vec4(aPosition, 1.0);
			positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

			gl_Position = positionVec4;
		}
	`;

	const frag = `
		precision highp float;

		varying vec2 vTexCoord;

		uniform vec3 metaballs[${N_balls}];

		const float WIDTH = ${width}.0;
		const float HEIGHT = ${height}.0;

		vec3 hsv2rgb(vec3 c) {
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}

		void main() {
			float x = vTexCoord.x * WIDTH;
			float y = vTexCoord.y * HEIGHT;
			float v = 0.0;

			for (int i = 0; i < ${N_balls}; i++) {
				vec3 ball = metaballs[i];
				float dx = ball.x - x;
				float dy = ball.y - y;
				float r = ball.z;
				v += r * r / (dx * dx + dy * dy);
			}

			if (0.9 < v && v < 1.1) {
				float a = (v - 0.9) * 4.;
				gl_FragColor = vec4(hsv2rgb(vec3(a, 1., 1.)), 1.0);
			} else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	`;