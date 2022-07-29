varying vec2 vUv;

void main( void ) {

	vec3 color = 0.5 + vec3( length( vUv * 2.0 - 1.0 ) ) * 0.5;

	gl_FragColor = vec4( color, 1.0 );

}