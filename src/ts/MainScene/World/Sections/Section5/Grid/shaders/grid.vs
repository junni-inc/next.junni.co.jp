attribute vec3 offsetPos;
attribute float num;
uniform float time;
uniform vec3 range;
uniform float contentNum;
uniform float particleSize;
uniform float visibility;
uniform float total;

uniform sampler2D noiseTex;

varying float vNum;
varying vec2 vUv;
varying float vAlpha;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )
#pragma glslify: spriteUVSelector = require('./spriteUVSelector.glsl' )

void main( void ) {

	vec3 oPos = offsetPos;
	float t = time * 0.5;
	float n = num / total;
	vec4 noise = texture2D( noiseTex, vec2( n * 1.2 ) );
	vec3 pos = position;

	vec3 hrange = range / 2.0;
	oPos = mod( oPos, range );
	oPos -= hrange;

	vAlpha = 1.0;
	vAlpha *= visibility;

	pos += oPos;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vAlpha *= ( 1.0 * (smoothstep( -10.0, 0.0, mvPosition.z ) ) );



}