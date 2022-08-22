attribute vec3 offsetPos;
attribute float num;

varying vec2 vUv;
varying vec3 vPos;

uniform float uRotate;
uniform float uVisibility;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

float easeOutBack(float x) {

	float c1 = 1.70158;
	float c3 = c1 + 1.0;

	return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
	
}

void main( void ) {

	vec3 pos = position;
	pos *= uVisibility;

	float r = easeInOutQuad( smoothstep( 0.0, 1.0, -num + uRotate * 2.0 ) );
	float ru = easeOutBack( linearstep( 0.0, 1.0, -num * 0.5 + uVisibility * 1.5) );

	pos.xy *= rotate( r * PI + ( 1.0 - uVisibility) );

	vec4 mvPosition = modelViewMatrix * vec4( pos + offsetPos, 1.0 );
	mvPosition.y += mvPosition.y * (1.0 - ru) * 2.0;
	// mvPosition.xy *= rotate( -(1.0 - ru) );

	gl_Position = projectionMatrix * mvPosition;

	vPos = mvPosition.xyz + pos * 30.0;
	vUv = uv;

}