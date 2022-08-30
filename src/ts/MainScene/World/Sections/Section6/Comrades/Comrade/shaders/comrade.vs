uniform float uVisibility;

attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

#ifdef IS_LINE

	uniform float uLine;
	
#endif

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>
#include <skinning_pars_vertex>

#pragma glslify: rotate = require('./rotate.glsl' )

float easeOutBack(float x) {

	float c1 = 1.70158;
	float c3 = c1 + 1.0;

	return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
	
}

void main( void ) {

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 objectNormal = vec3( normal );
	vec3 transformedNormal = normalMatrix * objectNormal;
	vec4 flipedTangent = tangent;
	flipedTangent.w *= -1.0;

	// #ifdef FLIP_SIDED
	// 	transformedNormal *= -1.0;
	// 	flipedTangent *= -1.0;
	// #endif

	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	
	vec3 normal = normalize( transformedNormal );
	vec3 tangent = normalize( ( modelViewMatrix * vec4( flipedTangent.xyz, 0.0 ) ).xyz );
	vec3 biTangent = normalize( cross( normal, tangent ) * flipedTangent.w );

	/*-------------------------------
		Position
	-------------------------------*/

	vec3 transformed = vec3( position );
	
	#include <skinning_vertex>

	vec3 pos = transformed;
	float visibility = (1.0 - easeOutBack(linearstep( 0.0, 1.5, +(pos.z - 2.0) + uVisibility * 4.0 ))) * 2.0;
	pos.xy *= rotate( visibility );

	float invUVisibility = (1.0 - uVisibility );
	pos.xy *= max( 0.0, 1.0 - visibility );
	pos.xy *= rotate( invUVisibility * 3.0 );
	pos.zy += invUVisibility * 2.0 ;
	
	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vUv.y = 1.0 - vUv.y;
	vNormal = normal;
	vTangent = tangent;
	vBitangent = biTangent;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;
	vHighPrecisionZW = gl_Position.zw;
	
}