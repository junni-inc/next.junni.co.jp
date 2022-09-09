uniform vec2 uTile;
uniform float uTextSelector;
uniform float uVisibility;
uniform float time;

varying vec2 vUv;

#pragma glslify: import('./constants.glsl' )

#ifdef IS_DEPTH

	varying vec2 vHighPrecisionZW;

#endif

vec2 spriteUVSelector( vec2 uv, vec2 tile, float selector ) {

	uv.x += mod(selector, tile.x);
	uv.y -= floor(selector / tile.x);

	uv.y -= 1.0;
	uv /= tile;
	uv.y += 1.0;
	
	return uv;
	
}

#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;

	pos.y += sin( - time + modelViewMatrix[3][0] ) * 0.2;
	pos *= uVisibility;


	if( uVisibility > 1.0 ) {

		pos *= 1.0 - ( uVisibility - 1.0 );
		
	}
	

	float jump = clamp( mod(uVisibility, 1.0), 0.0, 1.0 );

	pos.y += sin( jump * PI );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = spriteUVSelector( uv, uTile, uTextSelector);

	#ifdef IS_DEPTH

		vHighPrecisionZW = gl_Position.zw;
		
	#endif

}