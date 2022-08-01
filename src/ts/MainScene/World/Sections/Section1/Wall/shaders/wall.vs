varying vec2 vUv;
varying vec3 vNormal;
varying float vTexBlend;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	
	vUv -= 0.5;
	vUv *= 2.0;
	vUv += 0.5;
	
	vNormal = normalMatrix * normal;
	vTexBlend = normal.z >= 1.0 ? 1.0 : 0.0;

}