uniform sampler2D tex;
varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec4 col = texture2D( tex, vUv );
	col.w *= vAlpha;

	gl_FragColor = col;

}