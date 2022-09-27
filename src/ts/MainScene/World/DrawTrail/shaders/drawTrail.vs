attribute vec2 computeUV;
attribute vec4 tangent;

uniform sampler2D uPosDataTex;
uniform vec2 uDataSize;
uniform float uMaterial[6];
uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

mat3 makeRotationDir( vec3 direction, vec3 up ) {

	vec3 xaxis = normalize( cross( up, direction ) );
	vec3 yaxis = normalize( cross( direction, xaxis ) );

	return mat3(
		xaxis.x, yaxis.x, direction.x,
		xaxis.y, yaxis.y, direction.y,
		xaxis.z, yaxis.z, direction.z
	);

}

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	vec3 pos = position;
	pos.z *= 0.0;

    vec2 nextUV = computeUV + vec2(1.0 / ( uDataSize.x ), 0.0);

	vec4 posData = texture2D( uPosDataTex, computeUV );
    vec4 nextPosData = texture2D( uPosDataTex, nextUV );
	
    vec3 delta = ( posData.xyz - nextPosData.xyz );
	vec3 vec = normalize( delta );

	// length

	float trailLength = 0.0;
	trailLength += uMaterial[0] *( 0.054 );
	trailLength += uMaterial[1] * 0.1;
	trailLength += uMaterial[2] * 0.4;
	trailLength += uMaterial[3] * 1.0;
	trailLength += uMaterial[4] * 1.0;
	trailLength += uMaterial[5] * 0.5;

	// thickness

	float trailClamp = 1.0 - min( (1.0 - uv.y) / trailLength, 1.0);
	float thicknessWeight = sin( trailClamp * PI ) * length(delta) * 3.0;

	float thickness = 0.0;
	thickness += uMaterial[0] * 1.5 * thicknessWeight;
	thickness += uMaterial[1] * 3.0 * thicknessWeight;
	thickness += uMaterial[2] * 0.3 * thicknessWeight;
	thickness += uMaterial[3] * 1.0;
	thickness += uMaterial[4] * 0.05 * thicknessWeight;
	thickness += uMaterial[5] * 1.0 * thicknessWeight;
	
	mat2 sec4Rot = rotate( - (PI / 2.0) * uMaterial[3] );
	pos.xy *= sec4Rot;
	
	mat3 rot = makeRotationDir(vec, mix( vec3( 0.0, 0.0, 1.0 ), vec3( 0.0, 1.0, 0.0 ), uMaterial[3] ) );
	pos *= rot;
	pos *= thickness;
	pos += posData.xyz;
	
	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normalMatrix * normal;
	vec4 flipedTangent = tangent;
	flipedTangent.w *= -1.0;

	#ifdef FLIP_SIDED
		transformedNormal *= -1.0;
		flipedTangent *= -1.0;
	#endif
	
	vec3 normal = normalize( transformedNormal );
	normal.xy *= sec4Rot;
	normal *= rot;

	vec3 tangent = normalize( ( modelViewMatrix * vec4( flipedTangent.xyz, 0.0 ) ).xyz );
	vec3 biTangent = normalize( cross( normal, tangent ) * flipedTangent.w );

	/*-------------------------------
		Shadow
	-------------------------------*/
	
	vec4 shadowWorldPos;
	
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			
			shadowWorldPos = worldPos + vec4( vec4( transformedNormal, 0.0 ) * modelMatrix ) * directionalLightShadows[ i ].shadowNormalBias;
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPos;
			
		}
		#pragma unroll_loop_end
		
	#endif

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