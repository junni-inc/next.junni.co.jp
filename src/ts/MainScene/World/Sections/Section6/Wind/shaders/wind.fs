uniform sampler2D tex;
uniform sampler2D texBlur;

varying float vNum;
varying float vAlpha;
varying vec2 vUv;

void main( void ) {

	vec4 col = vec4( 1.0 );
	col.w *= 0.2;
	col.w *= vAlpha;
	

	gl_FragColor = col;

}