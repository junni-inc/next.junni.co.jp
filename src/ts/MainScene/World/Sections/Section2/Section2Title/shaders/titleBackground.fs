varying vec2 vUv;
uniform float uVisibility;

void main( void ) {

	vec3 col = vec3( 0.0 );
	float alpha = uVisibility;

	gl_FragColor = vec4( col, alpha );

}