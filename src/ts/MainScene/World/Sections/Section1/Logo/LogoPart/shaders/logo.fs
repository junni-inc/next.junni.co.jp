uniform vec3 uColor;
varying vec3 vNormal;

uniform sampler2D uMatCapTex;

varying vec2 vUv;

void main( void ) {

	vec3 normal = normalize( vNormal );
	// vec3 col = texture2D( uMatCapTex, vec2( normal.x, normal.y ) * 0.95 * 0.5 + 0.5 ).xyz;

	vec3 color = vec3( 1.0, 1.0, 1.0 );

	gl_FragColor = vec4( color, 1.0 );

}