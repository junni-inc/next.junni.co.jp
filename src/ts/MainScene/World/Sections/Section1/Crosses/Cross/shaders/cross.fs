uniform float time;
varying vec2 vUv;
varying vec3 vPos;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = hsv2rgb( vec3( -(vPos.x + vPos.y) * 0.01 + 0.3 + time * 0.1, 1.0, 1.0  ) );
	// color = vec3( 1.0 );
	gl_FragColor = vec4( color, 1.0 );

}