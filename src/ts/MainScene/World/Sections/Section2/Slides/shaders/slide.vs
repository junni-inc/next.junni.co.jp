uniform float time;
uniform float speed;
varying vec2 vUv;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vUv.x += time * 0.1 * speed;

}