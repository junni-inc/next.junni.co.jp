attribute vec4 tangent;
attribute vec2 computeUV;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying float vAlpha;

uniform float time;

uniform float uVisibility;
uniform float uJump;
uniform float uSectionViewing;
uniform sampler2D dataPos;
uniform sampler2D dataVel;
uniform float aboutOffset;
uniform vec2 dataSize;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )
#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;

#endif


float easeOutQuart( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>

mat3 makeRotationDir( vec3 direction, vec3 up ) {
	vec3 xaxis = normalize( cross( up, direction ) );
	vec3 yaxis = normalize( cross( direction, xaxis ) );

	return mat3(
		xaxis.x, yaxis.x, direction.x,
		xaxis.y, yaxis.y, direction.y,
		xaxis.z, yaxis.z, direction.z
	);

}

void main( void ) {

	vAlpha = easeOutQuart( smoothstep( 0.0, 0.6, -computeUV.x + uVisibility * 1.6 ) );
	float posYOffset = 1.0 - easeOutQuart( smoothstep( 0.0, 0.6, -computeUV.x + (1.0 - uJump) * 1.6 ) );

	/*-------------------------------
		Position
	-------------------------------*/
	
    vec3 p = position;
	p *= (vAlpha);

    vec3 pos = vec3( 0.0 );
	pos.xz = texture2D( dataPos, computeUV).xz;
	pos.y += (posYOffset) * 12.0;
	pos.xz *= rotate( sin(computeUV.y * 20.0 + time * 0.6 + posYOffset ) * posYOffset * 0.2 );

	// vec3 vec = texture2D( dataVel, computeUV).xyz;
	// p *= makeRotationDir(vec3( vec.x, 0.0, vec.z ), vec3( 0.0, 1.0, 0.0 ) );

	vec4 worldPos = modelMatrix * vec4( p + pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;
	
	vUv = uv;
	vNormal = normal;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;

	#ifdef DEPTH
	
		vHighPrecisionZW = gl_Position.zw;
		
	#endif

}