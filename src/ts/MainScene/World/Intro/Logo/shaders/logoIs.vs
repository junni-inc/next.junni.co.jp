varying vec2 vUv;

uniform float uIsVisibility;
uniform float uNum;

varying float vAlpha;

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

void main( void ) {

	vec3 pos = position;

	#ifdef IS_LINE

		pos.x += 0.07;
		pos.x *= easeInOutQuad( linearstep( 0.0, 0.6, uIsVisibility ) );
		pos.x -= 0.07;
		
		vAlpha = 1.0;
	#else
		float v = easeInOutQuad( linearstep( 0.4, 1.0, uIsVisibility ) );
		pos.x -= ( 1.0 - v ) * 0.05;
		vAlpha = v;
	#endif

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}