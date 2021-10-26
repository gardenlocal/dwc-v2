// horizontal gradient 
// orange - white - green

const HorizontalGradientFrag = `

#ifdef GL_ES
precision mediump float;
#endif

// varying vec2 vUvs;
uniform vec2 u_resolution;
uniform float u_time;

highp float dist(vec2 a, vec2 b) {
  return sqrt(pow(a.x - b.x, 2.) + pow(a.y - b.y, 2.5));
}

void main() {
    // vec2 st = gl_FragCoord.xy;
    vec2 st = gl_FragCoord.xy/u_resolution;    

    vec3 color;
    vec2 u_point1 = vec2(0.500,0.170); // bottom
    vec2 u_point2 = vec2(0.500,0.500); // midle white
    vec2 u_point3 = vec2(0.530,0.760); // top
    
    vec3 u_color1 = vec3(12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0); // green
    vec3 u_color2 = vec3(1.0, 1.0, 1.0);  // middle white
    vec3 u_color3 = vec3(253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0); // orange
	
    float u_radius1 = 0.1;
    float u_radius2 = 0.1;
    float u_radius3 = 0.1;

    highp float d1 = dist(gl_FragCoord.xy, u_point1 * u_resolution);
    highp float d2 = dist(gl_FragCoord.xy, u_point2 * u_resolution); // middle white
    highp float d3 = dist(gl_FragCoord.xy, u_point3 * u_resolution);

    if (d1 <= u_radius1) { // bottom green
      color = u_color1;
    } 
    else if (d2 <= u_radius2) { // middle white
      color = u_color2;
    } else if (d3 <= u_radius3) {  // top orange
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

    // color.x = (gl_FragCoord.x / 1000.0);

    gl_FragColor = vec4(color, 1.0);
}

`
export default HorizontalGradientFrag;