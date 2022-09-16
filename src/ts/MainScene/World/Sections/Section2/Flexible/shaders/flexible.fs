uniform sampler2D uTex;
varying vec2 vUv;
uniform float time;

void main( void ) {

	vec4 col1 = texture2D( uTex, vUv );
	vec4 col2 = texture2D( uTex, vUv + vec2( 0.001, 0.0 ));
	vec4 col3 = texture2D( uTex, vUv + vec2( 0.002, 0.0 ) );

	// col1 = 1.0 - col1;
	// col2 = 1.0 - col2;
	// col3 = 1.0 - col3;

	// col1.x *= sin( time + vUv.x ) * 0.5 + 0.5;
	// col2.x *= sin( time + vUv.x* 2.0 ) * 0.5 + 0.5;
	// col3.x *= sin( time + vUv.x * 3.0 ) * 0.5 + 0.5;

	gl_FragColor = vec4( col1.x * 1.0, col2.x * 1.0, col3.x * 1.0, 1.0 );

}