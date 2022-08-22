uniform float uVisibility;
uniform float num;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;

#pragma glslify: rotate = require('./rotate.glsl' )

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

float easeOutBack(float x) {

	float c1 = 1.70158;
	float c3 = c1 + 1.0;

	return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
	
}

void main( void ) {

	float r = 1.0 - easeOutBack( linearstep( 0.0, 1.0, -num * 0.5 + uVisibility * 1.5) );
	vec3 pos = position;
	// pos.xy *= rotate( r );
	pos *= 1.0 - r;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	mvPosition.xy *= rotate( (-r) * 1.0);
	mvPosition.xy *= 1.0 - r * 0.5;

	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal = normalMatrix * normal;
	
}