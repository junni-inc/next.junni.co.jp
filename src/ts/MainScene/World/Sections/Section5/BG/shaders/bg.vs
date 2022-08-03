varying vec2 vUv;
varying vec3 vDir;

void main( void ) {

	vec3 pos = position;

	vDir = normalize( pos - cameraPosition );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}