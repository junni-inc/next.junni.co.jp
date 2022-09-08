// https://qiita.com/aa_debdeb/items/26ab808de6745611df53

varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform bool direction;
uniform float blurRange;

#pragma glslify: blur13 = require( './gaussBlur13.glsl' )


// Gaussianブラーの重み
uniform float[GAUSS_WEIGHTS] uWeights;

void main(void) {
  vec2 coord = vec2(gl_FragCoord.xy);
  vec2 size = resolution;

  vec3 sum = uWeights[0] * texture2D(backbuffer, vUv).rgb;
  
  for (int i = 1; i < GAUSS_WEIGHTS; i++) {
    vec2 offset = (direction ? vec2(i, 0) : vec2(0, i)) * blurRange;
    sum += uWeights[i] * texture2D(backbuffer, vUv + offset / resolution).rgb;
    sum += uWeights[i] * texture2D(backbuffer, vUv - offset / resolution).rgb;
  }
  gl_FragColor = vec4(sum, 1.0);
}