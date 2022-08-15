uniform vec3 uColor;
varying vec2 vUv;

void main( void ) {

	gl_FragColor = vec4( uColor, 1.0 );

}