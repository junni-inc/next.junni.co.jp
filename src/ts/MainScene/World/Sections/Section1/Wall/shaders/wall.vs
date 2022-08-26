varying vec2 vUv;
varying vec3 vNormal;
varying float vTexBlend;
uniform vec3 velocity;
uniform float uVisibility;

void main( void ) {

	vec3 pos = position;
	pos *= uVisibility;
	// pos *= velocity;
	// pos *= 1.0 - pow(smoothstep( 0.0, 4.0, length( velocity) ), 2.0 ) * 0.5;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	
	vNormal = normalMatrix * normal;
	vTexBlend = normal.z >= 1.0 ? 1.0 : 0.0;

}