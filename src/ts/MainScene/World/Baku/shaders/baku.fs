varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

/*-------------------------------
	Require
-------------------------------*/

#include <packing>

vec2 packing16( float value ) { 

	float v1 = value * 255.0;
	float r = floor(v1);

	float v2 = ( v1 - r ) * 255.0;
	float g = floor( v2 );

	return vec2( r, g ) / 255.0;

}

/*-------------------------------
	Requiers
-------------------------------*/

#include <common>
#pragma glslify: random = require('./random.glsl' )

/*-------------------------------
	Material Uniforms
-------------------------------*/

uniform float time;
uniform vec2 winResolution;
uniform float uTransparent;
uniform float uLine;

/*-------------------------------
	Textures
-------------------------------*/

uniform sampler2D uSceneTex;
uniform sampler2D uBackSideNormalTex;

#ifdef USE_MAP

	uniform sampler2D map;

#else

	uniform vec3 color;

#endif

#ifdef USE_NORMAL_MAP

	uniform sampler2D normalMap;

#endif

#ifdef USE_ROUGHNESS_MAP

	uniform sampler2D roughnessMap;

#else

	uniform float roughness;

#endif

#ifdef USE_ALPHA_MAP

	uniform sampler2D alphaMap;

#else

	uniform float opacity;
	
#endif

#ifdef USE_METALNESS_MAP

	uniform sampler2D metalnessMap;

#else

	uniform float metalness;

#endif

#ifdef USE_EMISSION_MAP

	uniform sampler2D emissionMap;

#else

	uniform vec3 emission;

#endif

/*-------------------------------
	Types
-------------------------------*/

struct Geometry {
	vec3 pos;
	vec3 posWorld;
	vec3 viewDir;
	vec3 viewDirWorld;
	vec3 normal;
	vec3 normalWorld;
};

struct Light {
	vec3 direction;
	vec3 color;
};

struct Material {
	vec3 albedo;
	vec3 diffuseColor;
	vec3 specularColor;
	float metalness;
	float roughness;
	float opacity;
};

/*-------------------------------
	Lights
-------------------------------*/

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif

/*-------------------------------
	Shadow
-------------------------------*/

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;
	uniform float cameraNear;
	uniform float cameraFar;

#endif

#ifdef USE_SHADOWMAP

#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];

		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];

	#endif

	#define SHADOW_SAMPLE_COUNT 4

	vec2 poissonDisk[ SHADOW_SAMPLE_COUNT ];

	void initPoissonDisk( float seed ) {

		float r = 0.1;
		float rStep = (1.0 - r) / float( SHADOW_SAMPLE_COUNT );

		float ang = random( gl_FragCoord.xy * 0.01 + sin( time ) ) * PI2 * 1.0;
		float angStep = ( ( PI2 * 11.0 ) / float( SHADOW_SAMPLE_COUNT ) );
		
		for( int i = 0; i < SHADOW_SAMPLE_COUNT; i++ ) {

			poissonDisk[ i ] = vec2(
				sin( ang ),
				cos( ang )
			) * pow( r, 0.75 );

			r += rStep;
			ang += angStep;
		}
		
	}

	vec2 compairShadowMapDepth( sampler2D shadowMap, vec2 shadowMapUV, float depth ) {

		if( shadowMapUV.x < 0.0 || shadowMapUV.x > 1.0 || shadowMapUV.y < 0.0 || shadowMapUV.y > 1.0 ) {

			return vec2( 1.0, 0.0 );

		}

		float shadowMapDepth = unpackRGBAToDepth( texture2D( shadowMap, shadowMapUV ) );

		if( 0.0 >= shadowMapDepth || shadowMapDepth >= 1.0 ) {

			return vec2( 1.0, 0.0 );

		}
		
		float shadow = depth <= shadowMapDepth ? 1.0 : 0.0;

		return vec2( shadow, shadowMapDepth );
		
	}

	float shadowMapPCF( sampler2D shadowMap, vec4 shadowMapCoord, vec2 shadowSize ) {

		float shadow = 0.0;
		
		for( int i = 0; i < SHADOW_SAMPLE_COUNT; i ++  ) {
			
			vec2 offset = poissonDisk[ i ] * shadowSize; 

			shadow += compairShadowMapDepth( shadowMap, shadowMapCoord.xy + offset, shadowMapCoord.z ).x;
			
		}

		shadow /= float( SHADOW_SAMPLE_COUNT );

		return shadow;

	}

	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float bias, vec4 shadowMapCoord ) {
		
		shadowMapCoord.xyz /= shadowMapCoord.w;
		shadowMapCoord.z += bias - 0.0001;

		initPoissonDisk(time);

		vec2 shadowSize = 1.0 / shadowMapSize;

		return shadowMapPCF( shadowMap, shadowMapCoord, shadowSize );

	}

#endif

/*-------------------------------
	RE
-------------------------------*/

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );

}

vec3 lambert( vec3 diffuseColor ) {

	return diffuseColor / PI;

}

float gSchlick( float d, float k ) {

	if( d == 0.0 ) return 0.0;

	return d / ( d * ( 1.0 - k ) + k );
	
}

float gSmith( float dNV, float dNL, float roughness ) {

	float k = clamp( roughness * sqrt( 2.0 / PI ), 0.0, 1.0 );

	return gSchlick( dNV, k ) * gSchlick( dNL, k );
	
}

float fresnel( float d ) {
	
	float f0 = 0.04;

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );

}

vec3 RE( Geometry geo, Material mat, Light light) {

	vec3 lightDir = normalize( light.direction );
	vec3 halfVec = normalize( geo.viewDir + lightDir );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );

	vec3 irradiance = light.color * dNL;

	// diffuse
	vec3 diffuse = lambert( mat.diffuseColor ) * irradiance;

	// specular
	float D = ggx( dNH, mat.roughness );
	float G = gSmith( dNV, dNL, mat.roughness );
	float F = fresnel( dLH );
	
	vec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor ) * irradiance; 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	
	vec3 color = vec3( mix( vec3( 1.0 ), mat.diffuseColor * 0.5 + 0.5, length( mat.diffuseColor ) ) )* mix( #000, vec3( 1.0, 1.0, 1.0 ), dNL + random(gl_FragCoord.xy * 0.001) * 0.15 );
	c = mix( c, vec3( 1.0 ), uLine);

	return c;

}

/*-------------------------------
	Main
-------------------------------*/

void main( void ) {

	#ifdef IS_LINE

		gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
		return;
		
	#endif

	/*-------------------------------
		Material
	-------------------------------*/

	Material mat;

	#ifdef USE_MAP

		vec4 color = LinearTosRGB( texture2D( map, vUv ) );
		mat.albedo = color.xyz;
		mat.opacity = color.w;

	#else

		mat.albedo = color.xyz;
		mat.opacity = 1.0;
	
	#endif

	#ifdef USE_ROUGHNESS_MAP

		mat.roughness = texture2D( roughnessMap, vUv ).y;

	#else

		mat.roughness = roughness;
	
	#endif

	#ifdef USE_METALNESS_MAP

		mat.metalness = texture2D( metalnessMap, vUv ).z;

	#else

		mat.metalness = metalness;
	
	#endif

	#ifdef USE_ALPHA_MAP

		mat.opacity = texture2D( alphaMap, vUv ).x;

	#else

		mat.opacity *= opacity;

	#endif

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	// output
	// vec3 outColor = mix( vec3( 0.0 ), vec3( mix( vec3( 1.0 ), mat.diffuseColor, length( mat.diffuseColor ) )  ), uLine );
	vec3 outColor = vec3( 0.0 );
	float outOpacity = mat.opacity;

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
	
	#endif

	/*-------------------------------
		Geometry
	-------------------------------*/

	float faceDirection = gl_FrontFacing ? 1.0 : -1.0;

	Geometry geo;
	geo.pos = -vViewPos;
	geo.posWorld = vWorldPos;
	geo.viewDir = normalize( vViewPos );
	geo.viewDirWorld = normalize( geo.posWorld - cameraPosition );
	geo.normal = normalize( vNormal ) * faceDirection;
	geo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );

	// refract

	vec3 refractCol = vec3( 0.0 );
	vec2 screenUv = gl_FragCoord.xy / winResolution.xy;
	vec2 refractUv = screenUv;

	float slide;
	float refractPower = 0.2;
	vec2 refractUvR;
	vec2 refractUvG;
	vec2 refractUvB;

	#pragma unroll_loop_start
	for ( int i = 0; i < 16; i ++ ) {
		
		slide = float( UNROLLED_LOOP_INDEX ) / 16.0 * 0.03 + random( screenUv ) * 0.01;

		refractUvR = refractUv - geo.normal.xy * ( refractPower + slide * 1.0 ) * uTransparent;
		refractUvG = refractUv - geo.normal.xy * ( refractPower + slide * 1.5 ) * uTransparent;
		refractUvB = refractUv - geo.normal.xy * ( refractPower + slide * 2.0 ) * uTransparent;

		refractCol.x += texture2D( uSceneTex, refractUvR ).x;
		refractCol.y += texture2D( uSceneTex, refractUvG ).y;
		refractCol.z += texture2D( uSceneTex, refractUvB ).z;

	}
	#pragma unroll_loop_end
	refractCol /= float( 16 );

	outColor += refractCol * mix( vec3( 1.0 ), mat.diffuseColor, length( mat.diffuseColor ) ) * uTransparent;

	/*-------------------------------
		Lighting
	-------------------------------*/
	
	Light light;

	#if NUM_DIR_LIGHTS > 0

		float shadow;

		#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

				light.direction = directionalLights[ i ].direction;
				light.color = directionalLights[ i ].color;
				shadow = 1.0;

				#if defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS

					shadow = getShadow( directionalShadowMap[ i ], directionalLightShadows[ i ].shadowMapSize, directionalLightShadows[ i ].shadowBias, vDirectionalShadowCoord[ i ] );

				#endif

				outColor += RE( geo, mat, light ) * shadow;
				
			}
		#pragma unroll_loop_end

	#endif

	/*-------------------------------
		EnvMap
	-------------------------------*/

	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float EF = mix( fresnel( dNV ), 1.0, mat.metalness );
	outColor += EF;
	
	/*-------------------------------
		Emission
	-------------------------------*/

	#ifdef USE_EMISSION_MAP

		outColor += LinearTosRGB( texture2D( emissionMap, vUv ) ).xyz;
	
	#else

		outColor += emission;

	#endif

	gl_FragColor = vec4( outColor, outOpacity );

}