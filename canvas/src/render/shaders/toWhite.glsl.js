// horizontal gradient 
// orange - white - green
// https://www.shadertoy.com/view/sdyXWt

const toWhite = `


#ifdef GL_ES
precision highp float;
#endif

// varying vec2 vUvs;
uniform vec2 u_resolution;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    // gl_FragColor = vec4(0.97, 0.97, 0.97, color.a);
    float m = max(color.r, color.g);
    gl_FragColor = vec4(m, m, m, color.a);
}

`
export default toWhite;