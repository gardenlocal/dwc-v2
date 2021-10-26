// https://thebookofshaders.com/edit.php#05/impulse.frag
// Author: Inigo Quiles
// Title: Impulse
// https://thebookofshaders.com/05/
const gradientFragment = `

#ifdef GL_ES
precision mediump float;
#endif

// varying vec2 vUvs;
uniform vec2 u_resolution;
uniform float u_time;

uniform vec2 u_point1;
uniform float u_radius1;
uniform vec3 u_color1;

uniform vec2 u_point2;
uniform float u_radius2;
uniform vec3 u_color2;

highp float dist(vec2 a, vec2 b) {
  return sqrt(pow(a.x - b.x, 2.) + pow(a.y - b.y, 2.));
}

void main() {
    vec2 st = gl_FragCoord.xy;
    // vec2 st = gl_FragCoord.xy/u_resolution;    

    vec3 color;

    highp float d1 = dist(gl_FragCoord.xy, u_point1 * u_resolution);
    highp float d2 = dist(gl_FragCoord.xy, u_point2 * u_resolution);

    if (d1 <= u_radius1) {
      color = u_color1;
    } else if (d2 <= u_radius2) {
      color = u_color2;
    } else {
      highp float t1, t2, sum;
      t1 = max(0., 1. / pow(d1 - u_radius1*u_time, 2.1));
      t2 = max(0., 1. / pow(d2 - u_radius2, 2.1));
      sum = (t1 + t2);
      color = u_color1 * u_time * (t1 / sum) + u_color2 * (t2 / sum);
    }

    //color.x = (gl_FragCoord.x / 1000.0);

    gl_FragColor = vec4(color, 1.0);
}

`

export default gradientFragment;