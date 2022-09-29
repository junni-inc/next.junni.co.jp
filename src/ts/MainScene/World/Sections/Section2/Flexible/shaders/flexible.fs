uniform sampler2D uTex;
varying vec2 vUv;
uniform float time;
uniform float uVisibility;

void main( void ) {

	vec4 col = texture2D( uTex, vUv );
	col.w *= uVisibility;

	gl_FragColor = col;

}