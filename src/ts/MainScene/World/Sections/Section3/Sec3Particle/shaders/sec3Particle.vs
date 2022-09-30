attribute vec2 num;
attribute vec3 offsetPos;

uniform float time;
uniform vec3 range;
uniform float contentNum;
uniform float uVisibility;
varying float vAlpha;
varying vec2 vUv;
varying vec2 vNum;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )
#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

vec2 spriteUVSelector( vec2 uv, vec2 tile, float frames, float time ) {

	float t = floor(frames * mod( time, 1.0 ) );

	uv.x += mod(t, tile.x);
	uv.y -= floor(t / tile.x);

	uv.y -= 1.0;
	uv /= tile;
	uv.y += 1.0;
	
	return uv;
	
}

void main( void ) {

	vec3 oPos = offsetPos;
	float t = time * 0.5;

	vec3 hrange = range / 2.0;
	float center = linearstep( 5.0, 1.0, length( oPos.xz - range.xz / 2.0 ) );
	oPos.y += time * center;
	oPos = mod( oPos, range );
	oPos -= range / 2.0;
	oPos.xz *= rotate( time * center );
	oPos.xz *= 1.0 + (1.0 - uVisibility);
	
	vec3 pos = position;
	pos *= smoothstep( hrange.y, hrange.y - 0.5, abs( oPos.y ) );
	pos *= num.y;
	pos *= 1.0 + exp( -mod( time * 1.0 + num.y * 2.0, 1.0) * 7.0 ) * 3.0 * num.y;
	// pos.xy *= rotate( exp( -mod( time * 1.0 + num.y, 1.0) * 7.0 ) * TPI );
	pos.xy *= rotate( time * num.y );
	pos += oPos;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = spriteUVSelector( uv, vec2( 6.0, 1.0 ), 6.0, num.x / 4.0 );
	vNum = num;

}