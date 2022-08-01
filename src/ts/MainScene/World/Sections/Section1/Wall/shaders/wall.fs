uniform sampler2D tex;
varying vec2 vUv;
varying vec3 vNormal;
varying float vTexBlend;

void main( void ) {

	vec4 logo = texture2D( tex, vUv );

	vec3 col = #d5ff16;
	col = mix( col, vec3( 0.0 ), logo.w * vTexBlend);

	vec3 normal = normalize( vNormal );

	vec3 outCol = vec3( 0.0 );
	outCol += mix( vec3( .3, 0.7, 0.2 ), col, dot( normal, normalize( vec3( 1.0, 1.0, 5.0 ) ) ) );
	// outCol += vec3( 0.2, 0.2, 0.0 );

	gl_FragColor = vec4( outCol, 1.0 );

}