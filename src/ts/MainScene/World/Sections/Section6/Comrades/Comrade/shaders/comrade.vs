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
/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>
#include <skinning_pars_vertex>

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

	#ifdef IS_LINE

		transformed += normal * 0.02 * uLine;
	
	#endif
	
	#include <skinning_vertex>

	vec3 pos = transformed;
	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normal;
	vTangent = tangent;
	vBitangent = biTangent;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;
	vHighPrecisionZW = gl_Position.zw;
	
}