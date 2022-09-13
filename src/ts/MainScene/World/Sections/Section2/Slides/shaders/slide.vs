attribute vec3 offsetPos;
attribute float scale;
attribute vec2 rnd;

uniform float uSectionViewing;
uniform float uVisibility;
uniform float uSlide;
uniform float time;
uniform float speed;

varying vec2 vUv;
varying float vAlpha;
varying vec2 vRnd;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;
	pos.y *= scale;
	pos.y += sin( time * .15 + uv.x * TPI ) * 5.0;
	pos += offsetPos;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vAlpha = uVisibility;

	vUv = uv;
	vUv.x *= 3.0;
	vUv.x += time * 0.1 * speed * rnd.x + rnd.y + uSectionViewing * rnd.x;
	vUv.x /= scale;


	vRnd = rnd;

}