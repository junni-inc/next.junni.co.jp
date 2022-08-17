uniform float uSectionViewing;
uniform float time;
uniform float speed;

varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec3 pos = position;
	pos.x += (1.0 - uSectionViewing) * 1.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vAlpha = uSectionViewing;

	vUv = uv;
	vUv.x += time * 0.1 * speed;

}