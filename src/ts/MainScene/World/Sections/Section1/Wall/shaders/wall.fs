uniform sampler2D tex;
varying vec2 vUv;
varying vec3 vNormal;
varying float vTexBlend;
uniform vec3 velocity;

void main( void ) {

	vec3 sceneCol = texture2D( tex, vUv ).xyz;
	vec3 noiseCol = vec3( 1.0 );

	vec3 col = mix( noiseCol, sceneCol, vTexBlend );

	vec3 normal = normalize( vNormal );

	vec3 outCol = col;

	gl_FragColor = vec4( outCol, 1.0 );

}