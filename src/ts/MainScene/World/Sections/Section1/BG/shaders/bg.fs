uniform vec3 uColor;
uniform float time;
varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

void main( void ) {

	vec3 color = hsv2rgb( vec3( vUv.y * 0.2 + time * 0.1, 1.0 * 0.6, 1.0  ) );

	gl_FragColor = vec4( color, 1.0 );

}