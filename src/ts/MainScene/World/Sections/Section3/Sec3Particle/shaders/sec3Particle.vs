attribute float num;
uniform float time;
uniform vec3 range;
uniform float contentNum;
uniform float particleSize;
uniform float uVisibility;
varying float vNum;
varying float vAlpha;

#pragma glslify: rotate = require('./rotate.glsl' )
#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)


void main( void ) {

	vec3 pos = position;
	float t = time * 0.5;

	// pos += vec3( 
	// 	t * 4.0 + sin( t + ( position.y + position.z ) * 10.0 ) * 0.3,
	// 	0.0,
	// 	0.0
	// );

	vec3 hrange = range / 2.0;
	float center = linearstep( 4.0, 1.0, length( pos.xz - range.xz / 2.0 ) );
	pos.y += time * center;
	pos = mod( pos, range );
	pos -= range / 2.0;
	pos.xz *= rotate( time * center );
	pos.xz *= 1.0 + (1.0 - uVisibility);
	
	vAlpha = smoothstep( hrange.z, hrange.z - 0.5, abs( pos.z ) );
	vAlpha *= smoothstep( hrange.y, hrange.y - 0.5, abs( pos.y ) );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = ( 5.0 * (smoothstep( -8.0, 0.0, mvPosition.z ) + 0.1 ) ) * particleSize * uVisibility;

	vNum = num;

}