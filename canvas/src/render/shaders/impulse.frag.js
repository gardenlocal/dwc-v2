// https://thebookofshaders.com/edit.php#05/impulse.frag
// Author: Inigo Quiles
// Title: Impulse
// https://thebookofshaders.com/05/
const impulseFragment = `

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUvs;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//  Function from Iñigo Quiles
//  www.iquilezles.org/www/articles/functions/functions.htm
float impulse( float k, float x ){
    float h = k*x;
    return h*exp(0.708-h);
}

float plot(vec2 st, float pct){
  return  smoothstep( pct-2.0, pct, st.y) -
          smoothstep( pct, pct+0.236, st.y);
}

void main() {
    vec2 st = vUvs;
    // vec2 st = gl_FragCoord.xy/u_resolution;

    float y = impulse(8.496,st.x);

    vec3 color = vec3(y);

    float pct = plot(st,y);
    color = vec3(1.0,1.0,1.0) - pct*vec3(0.140,0.755,0.674);

    gl_FragColor = vec4(color,1.0);
}

`

export default impulseFragment;