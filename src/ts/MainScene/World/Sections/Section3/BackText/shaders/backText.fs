uniform sampler2D uTex;
uniform float uVisibility;
varying vec2 vUv;

void main( void ) {

	vec4 col = texture2D( uTex, vUv );

	col.w *= step( abs ( vUv.y - 0.5 ), uVisibility * 0.5 );

	if( col.w < 0.5 ) {

		discard;
		
	}

	gl_FragColor = col;

}