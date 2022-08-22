uniform float uVisibility;
varying vec2 vUv;

uniform float time;
uniform float len;

#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;

	float v = mod( uVisibility, 2.0 );

	if( v <= 1.0 ) {

		pos.y *= v;

	} else {
		pos.y += len;
		pos.y *= 2.0 - v;
		pos.y -= len;
	}
	

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}