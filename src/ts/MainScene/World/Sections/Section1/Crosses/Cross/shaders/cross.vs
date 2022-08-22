attribute vec3 offsetPos;
attribute float num;

varying vec2 vUv;
uniform float uRotate;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

void main( void ) {

	vec3 pos = position;

	float r = easeInOutQuad( smoothstep( 0.0, 1.0, -num + uRotate * 2.0 ) );

	pos.xy *= rotate( r * PI );

	pos += offsetPos;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}