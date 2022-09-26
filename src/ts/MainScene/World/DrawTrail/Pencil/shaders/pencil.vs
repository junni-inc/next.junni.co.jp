varying vec2 vUv;
uniform float uMaterial[6];

void main( void ) {

	vec3 pos = position;
	pos *= uMaterial[3];

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}