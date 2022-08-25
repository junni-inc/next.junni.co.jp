attribute float num;
attribute vec3 rnd;

varying vec2 vUv;
varying float vAlpha;
varying float vRnd;

uniform float total;
uniform float time;
uniform float uVisibility;

#pragma glslify: rotate = require('./rotate.glsl' )

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

void main( void ) {
	
	float offsetPos =  ( mod(num - time * rnd.x, total )- total / 2.0 ) * 0.3 ;


	vec3 pos = position;
	float v = easeInOutQuad( smoothstep( 0.0, 1.0, -rnd.x + uVisibility * 2.0 ) );
	pos.xy *= (0.5 + rnd.x * 0.5) + (1.0 - v) * 0.2;
	pos.z *= rnd.x;
	pos.z += offsetPos;
	// pos.xy *= rotate( 0.1 );
	
	vAlpha = v * smoothstep( 1.5, 0.0, abs(offsetPos) ) * rnd.y;
	vAlpha *= 0.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vRnd = rnd.x;
	
	vUv = uv;
	vUv.y += mod(num, 8.0) + 8.0;
	vUv.y /= 16.0;

}