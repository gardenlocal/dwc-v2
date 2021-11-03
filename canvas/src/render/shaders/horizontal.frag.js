// horizontal gradient 
// orange - white - green
// https://www.shadertoy.com/view/sdyXWt

const HorizontalGradientFrag = `


#ifdef GL_ES
precision mediump float;
#endif

// varying vec2 vUvs;
uniform vec2 u_resolution;
uniform float u_time;

highp float dist(vec2 a, vec2 b) {
  // return sqrt(pow(a.x - b.x, 2.) + pow(a.y - b.y, 2.5));  // radial
  return abs(a.y - b.y);  // linear
}

void main() {
    // vec2 st = gl_FragCoord.xy;
    vec2 st = gl_FragCoord.xy/u_resolution;    

    vec3 color;
    vec2 u_point1 = vec2(0.50,1.0 - sin(u_time)); // top
    vec2 u_point2 = vec2(0.50,0.50 - sin(u_time)); // midle white
    vec2 u_point3 = vec2(0.50,0.0 - sin(u_time)); // bottom

    vec3 u_color1 = vec3(253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0); // orange
    vec3 u_color2 = vec3(1.0, 1.0, 1.0);  // middle white
    vec3 u_color3 = vec3(12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0); // green
	
    float u_radius1 = 0.1;
    float u_radius2 = 0.1;
    float u_radius3 = 0.1;

    highp float d1 = dist(gl_FragCoord.xy / u_resolution, u_point1 );
    highp float d2 = dist(gl_FragCoord.xy / u_resolution, u_point2 ); // middle white
    highp float d3 = dist(gl_FragCoord.xy / u_resolution, u_point3 );

    if (d1 <= u_radius1) { // top
      color = u_color1;
    } 
    else if (d2 <= u_radius2) { // middle white
      color = u_color2;
    } else if (d3 <= u_radius3) {  // bottom
      color = u_color3;
    }
    else {
      highp float t1, t2, t3, sum;
      t1 = max(1. /pow(d1 - u_radius1, 2.0), 0.);
      t2 = max(1. / pow(d2 - u_radius2, 2.0), 0.);
      t3 = max(1. / pow(d3 - u_radius3, 2.0), 0.0);
      sum = (t1 + t2 + t3);
      color = u_color1 * (t1 / sum) + u_color2 * (t2 / sum) + u_color3 * (t3 / sum);
    }

    gl_FragColor = vec4(color, 1.0);
}

`
export default HorizontalGradientFrag;