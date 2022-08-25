attribute float num;
attribute vec3 rnd;

varying vec2 vUv;
varying float vAlpha;

uniform float time;
uniform float uVisibility;

#pragma glslify: rotate = require('./rotate.glsl' )
#pragma glslify: import('./constants.glsl' )

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

void main( void ) {

	float offsetPos =  ( mod(num - time * rnd.x, 100.0 )- 50.0 ) * 0.03 ;



	vec3 pos = position;
	float v = easeInOutQuad( smoothstep( 0.0, 1.0, -rnd.x + uVisibility * 2.0 ) );
	pos.xyz *= (0.6 + rnd.y * 0.4) + (1.0 - v) * 0.2;
	pos.z += offsetPos;
	// pos.xy *= rotate( time * 0.2 + v * 0.3 + offsetPos * 0.2 );
	// pos.xy *= rotate( num * 1.1 + time * 0.2 + v * 0.3 );

	vAlpha = v * smoothstep( 1.5, 0.0, abs(offsetPos) ) * rnd.y;

	float ex = mod( uv.x + time * 0.5, 1.0 );
	// vAlpha *= exp( -ex * 8.5 ) * ex * 23.0;
	// vAlpha *= exp( -ex * 10.0 );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vUv = uv;
	vUv.y += mod(num, 8.0) + 8.0;
	vUv.y /= 16.0;
	vUv.x -= time * rnd.z * 0.1;

}