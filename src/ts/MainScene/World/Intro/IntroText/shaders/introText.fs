uniform sampler2D tex;
uniform float uVisibility;
varying vec2 vUv;

void main( void ) {

	vec4 col = texture2D( tex, vUv );
	col.w *= uVisibility;

	gl_FragColor = col;

}