// https://thebookofshaders.com/edit.php#05/impulse.frag
// Author: Inigo Quiles
// Title: Impulse
// https://thebookofshaders.com/05/
const gradientFragment = `

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUvs;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_radius1;
uniform vec4 u_color1;

uniform float u_radius2;
uniform vec4 u_color2;

uniform vec4 u_color3;

highp float dist(vec2 a, vec2 b) {
  return sqrt(pow(a.x - b.x, 2.) + pow(a.y - b.y, 2.));
}

void main() {
    vec4 color;

    highp float distanceFromCenter = dist(gl_FragCoord.xy / u_resolution, vec2(0.48, 0.48));

    if (distanceFromCenter <= u_radius1) {
        highp float d = distanceFromCenter;
        color = mix(u_color1, u_color2, d / u_radius1);
    } else if (distanceFromCenter <= u_radius2) {
        highp float d = distanceFromCenter - u_radius1;
        color = mix(u_color2, u_color3, d / u_radius2);
    } else {
        highp float d = distanceFromCenter - u_radius2;
        color = mix(u_color2, u_color3, d / (1.0 - u_radius2));
    }

    gl_FragColor = color;
}

`

export default gradientFragment;