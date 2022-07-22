uniform sampler2D sceneTex;
uniform vec2 resolution;
varying vec2 vUv;

uniform float threshold;

void main() {
  vec3 c = texture2D(sceneTex, vUv).xyz;
  vec3 f;
  f.x = max(0.0, c.x - threshold);
  f.y = max(0.0, c.y - threshold);
  f.z = max(0.0, c.z - threshold);

  gl_FragColor = vec4(vec3(c) * f, 1.0);
}