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
uniform vec2 u_offset;
uniform float u_scale;

highp float dist(vec2 a, vec2 b) {
  // return sqrt(pow(a.x - b.x, 2.) + pow(a.y - b.y, 2.5));  // radial
  return abs(a.y - b.y);  // linear
}

void main() {
    // gl_FragColor = vec4(0.5, 0.25, 0.75, 1.0);
    // return;
    vec2 st = (gl_FragCoord.xy - u_offset.xy) / u_resolution / u_scale;
    float gradientScale = 4.0;
    st.y += u_time;
    st.y = st.y - (gradientScale * floor(st.y / gradientScale));

    vec3 color;

    vec2 u_point1 = vec2(0.50,gradientScale * 1.0);
    vec2 u_point2 = vec2(0.50,gradientScale * 0.75);
    vec2 u_point3 = vec2(0.50,gradientScale * 0.50);
    vec2 u_point4 = vec2(0.50,gradientScale * 0.25);
    vec2 u_point5 = vec2(0.50,gradientScale * 0.0);

    vec3 u_color1 = vec3(1.0, 1.0, 1.0);  // middle white
    vec3 u_color2 = vec3(253.0 / 256.0, 136.0 / 256.0, 11.0 / 256.0); // orange
    vec3 u_color3 = vec3(1.0, 1.0, 1.0);  // middle white
    vec3 u_color4 = vec3(12.0 / 256.0, 239.0 / 256.0, 66.0 / 256.0); // green
    vec3 u_color5 = vec3(1.0, 1.0, 1.0);  // middle white
	
    float u_radius1 = 0.001;
    float u_radius2 = 0.05;
    float u_radius3 = 0.001;
    float u_radius4 = 0.05;
    float u_radius5 = 0.001;

    if (st.y < u_radius5) {
      color = u_color5;
    } else if (st.y < u_point4.y - u_radius4) {
      float alpha = (st.y - u_radius5) / (u_point4.y - u_radius4 - u_radius5);
      color = mix(u_color5, u_color4, alpha);
    } else if (st.y < u_point4.y + u_radius4) {
      color = u_color4;
    } else if (st.y < u_point3.y - u_radius3) {
      float alpha = (st.y - u_point4.y - u_radius4) / (u_point3.y - u_radius3 - u_point4.y - u_radius4);
      color = mix(u_color4, u_color3, alpha);
    } else if (st.y < u_point3.y + u_radius3) {
      color = u_color3;
    } else if (st.y < u_point2.y - u_radius2) {
      float alpha = (st.y - u_point3.y - u_radius3) / (u_point2.y - u_radius2 - u_point3.y - u_radius3);
      color = mix(u_color3, u_color2, alpha);
    } else if (st.y < u_point2.y + u_radius2) {
      color = u_color2;
    } else if (st.y < u_point1.y - u_radius1) {
      float alpha = (st.y - u_point2.y - u_radius2) / (u_point1.y - u_radius1 - u_point2.y - u_radius2);
      color = mix(u_color2, u_color1, alpha);
    } else {
      color = u_color1;
    }

    /*
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
    */

    gl_FragColor = vec4(color, 1.0);
}

`
export default HorizontalGradientFrag;