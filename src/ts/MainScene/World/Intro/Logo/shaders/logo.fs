uniform sampler2D tex;
uniform float loaded;
varying vec2 vUv;

void main( void ) {

	vec4 logo = texture2D( tex, vUv );
	vec4 col = vec4( 1.0, 1.0, 1.0, logo.w );

	col *= step( vUv.y - loaded, 0.0 );

	gl_FragColor = col;

}