uniform sampler2D tex;
varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec4 col = vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 text = texture2D( tex, vUv );
	col.w *= vAlpha * text.w;

	gl_FragColor = col;

}