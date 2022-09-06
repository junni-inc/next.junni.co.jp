uniform float uVisibility;
varying vec2 vUv;

void main( void ) {

	vec3 col = vec3( 0.0 );

	vec2 glid = step( vec2( 0.985 ), mod( vUv * 20.0, vec2( 1.0, 1.0 ) ) );

	col += min( 1.0, glid.x + glid.y ) * 0.2;
	col *= uVisibility;

	gl_FragColor = vec4( col, 1.0 );

}