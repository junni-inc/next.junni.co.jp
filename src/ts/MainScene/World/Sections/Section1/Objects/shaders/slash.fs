uniform float time;
varying vec2 vUv;

void main( void ) {

	if( step( 0.0, sin( vUv.x * 30.0 - time * 5.0 ) ) > 0.0 ) discard;

	gl_FragColor = vec4( 1.0 );

}