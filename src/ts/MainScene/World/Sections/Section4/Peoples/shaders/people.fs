uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {

	vec4 col = texture2D( tex, vUv );

	if( col.w < 0.5 ) {

		discard;
		
	}

	gl_FragColor = col;

}