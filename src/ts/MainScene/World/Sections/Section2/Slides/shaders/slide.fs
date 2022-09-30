uniform sampler2D tex;
uniform float time;

varying vec2 vUv;
varying float vAlpha;
varying vec2 vRnd;

void main( void ) {

	vec4 col = vec4( vec3( 0.9 ), 1.0 );

	vec2 uv = vUv;
	
	vec4 text = texture2D( tex, uv );

	if( text.w < 0.2 ) discard;

	col.w *= vAlpha * text.w;

	gl_FragColor = col;

}