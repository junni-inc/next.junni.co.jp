attribute vec3 offsetPos;
attribute vec2 rnd;

uniform float uSectionViewing;
uniform float uVisibility;
uniform float uSlide;
uniform float time;
uniform float speed;

varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec3 pos = position;
	pos.x += uSlide;

	pos += offsetPos;
	// pos.z -= rnd.y * 10.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vAlpha = uVisibility;

	vUv = uv;
	vUv.x *= 2.0;
	vUv.x += time * 0.1 * speed * rnd.x + rnd.y;

}