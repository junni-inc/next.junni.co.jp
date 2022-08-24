attribute float num;
attribute float rnd;

varying vec2 vUv;
varying float vAlpha;

uniform float time;
uniform float uVisibility;

#pragma glslify: rotate = require('./rotate.glsl' )

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

void main( void ) {

	vec3 pos = position;
	float v = easeInOutQuad( smoothstep( 0.0, 1.0, -rnd + uVisibility * 2.0 ) );
	pos.xyz *= (0.6 + rnd * 0.4) + (1.0 - v) * 0.2;
	pos.z += ( num - 50.0 ) * 0.03;
	pos.xy *= rotate( num * 0.1 + time * 0.2 + v * 0.3 );

	vAlpha = v;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vUv = uv;
	vUv.y += mod(num, 8.0);
	vUv.y /= 16.0;

}