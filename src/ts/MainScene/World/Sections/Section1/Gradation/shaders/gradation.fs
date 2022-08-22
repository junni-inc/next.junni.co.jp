uniform float time;
varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = hsv2rgb( vec3( -vUv.x * 0.2 + 0.3 + time * 0.1 + random( gl_FragCoord.xy * 0.01 ) * 0.02, 0.95, 1.0  ) );
	gl_FragColor = vec4( color, 1.0 );

}