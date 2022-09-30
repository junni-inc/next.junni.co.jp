varying vec2 vUv;
uniform float uSectionViewing;

void main( void ) {

	vec3 pos = position;
	pos.xy -= (-1.0 + uSectionViewing) * vec2( 3.0, 0.6 );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}