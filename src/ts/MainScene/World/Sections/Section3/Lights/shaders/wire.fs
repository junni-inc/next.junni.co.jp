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
uniform float uVisibility;

/*-------------------------------
	Textures
-------------------------------*/

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

#ifdef IS_REFLECTIONPLANE

	uniform sampler2D reflectionTex;
	uniform vec2 renderResolution;
	uniform vec2 mipMapResolution;
	
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
	EnvMap
-------------------------------*/

#ifdef USE_ENV_MAP

	uniform sampler2D envMap;
	uniform float envMapIntensity;
	uniform float iblIntensity;
	uniform float maxLodLevel;

	#define ENVMAP_TYPE_CUBE_UV
	#include <cube_uv_reflection_fragment>

#endif

/*-------------------------------
	Reflection
-------------------------------*/

#define REF_MIPMAP_LEVEL 8.0

#ifdef IS_REFLECTIONPLANE

	vec2 getRefMipmapUV( vec2 uv, float level ) {

		vec2 ruv = uv;

		if( level > 0.0 ) {

			ruv.x *= 1.0 / ( 3.0 * ( pow( 2.0, level ) / 2.0 ) );
			ruv.y *= 1.0 / ( pow( 2.0, level ) );
			ruv.y += 1.0 / ( pow( 2.0, level ) );
			ruv.x += 1.0 / 1.5;
		
		} else {

			ruv.x /= 1.5;
			
		}

		return ruv;

	}
	
	vec4 cubic(float v) {
		vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
		vec4 s = n * n * n;
		float x = s.x;
		float y = s.y - 4.0 * s.x;
		float z = s.z - 4.0 * s.y + 6.0 * s.x;
		float w = 6.0 - x - y - z;
		return vec4(x, y, z, w);
	}

	// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
	vec4 textureBicubic(sampler2D t, vec2 texCoords, vec2 textureSize) {
		vec2 invTexSize = 1.0 / textureSize;
		texCoords = texCoords * textureSize - 0.5;
		vec2 fxy = fract(texCoords);
		texCoords -= fxy;
		vec4 xcubic = cubic(fxy.x);
		vec4 ycubic = cubic(fxy.y);
		vec4 c = texCoords.xxyy + vec2 (-0.5, 1.5).xyxy;
		vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
		vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;
		offset *= invTexSize.xxyy;
		vec4 sample0 = texture2D(t, offset.xz);
		vec4 sample1 = texture2D(t, offset.yz);
		vec4 sample2 = texture2D(t, offset.xw);
		vec4 sample3 = texture2D(t, offset.yw);
		float sx = s.x / (s.x + s.y);
		float sy = s.z / (s.z + s.w);
		return mix(
		mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
	}

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

	return c;

}

/*-------------------------------
	Main
-------------------------------*/

void main( void ) {

	/*-------------------------------
		Material
	-------------------------------*/

	Material mat;
	mat.albedo = vec3( 0.2 );
	mat.roughness = 0.5;
	mat.metalness = 0.1;
	mat.opacity = 1.0;
	mat.opacity *= uVisibility;

	// if( mat.opacity < 0.5 ) discard;

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	// output
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

	#ifdef USE_NORMAL_MAP
		
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );

		#ifdef DOUBLE_SIDED

			tangent *= faceDirection;
			bitangent *= faceDirection;
		
		#endif
		
		mat3 vTBN = mat3( tangent, bitangent, geo.normal );
		
		vec3 mapN = texture2D( normalMap, vUv ).xyz;
		mapN = mapN * 2.0 - 1.0;
		geo.normal = normalize( vTBN * mapN );

	#endif
	
	geo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );

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

				#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHTS < NUM_DIR_LIGHT_SHADOWS

					shadow = getShadow( directionalShadowMap[ i ], directionalLightShadows[ i ].shadowMapSize, directionalLightShadows[ i ].shadowBias, vDirectionalShadowCoord[ i ] );

				#endif

				outColor += RE( geo, mat, light ) * shadow;
				
			}
		#pragma unroll_loop_end

	#endif

	#if defined( USE_ENV_MAP ) || defined( IS_REFLECTIONPLANE )

		float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
		float EF = fresnel( dNV );

	#endif

	/*-------------------------------
		Environment Lighting
	-------------------------------*/

	#ifdef USE_ENV_MAP

		vec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );
		refDir.x *= -1.0;
	
		vec4 envMapColor = textureCubeUV( envMap, geo.normalWorld, 1.0 ) * iblIntensity * envMapIntensity;
		outColor += mat.diffuseColor * envMapColor.xyz * ( 1.0 - mat.metalness );

	#endif

	/*-------------------------------
		Reflection
	-------------------------------*/
	
	#ifdef IS_REFLECTIONPLANE
	
		vec2 refUV = gl_FragCoord.xy / renderResolution;

		refUV.x += geo.normal.x * 0.5;

		float l = (mat.roughness ) * 1.6 * REF_MIPMAP_LEVEL;

		float offset1 = floor( l );
		float offset2 = offset1 + 1.0;
		float blend = fract( l );
		
		vec2 ruv1 = getRefMipmapUV( refUV, offset1 );
		vec2 ruv2 = getRefMipmapUV( refUV, offset2 );

		vec3 ref1 = textureBicubic( reflectionTex, ruv1, mipMapResolution ).xyz;
		vec3 ref2 = textureBicubic( reflectionTex, ruv2, mipMapResolution ).xyz;

		vec3 ref = mat.specularColor * mix( ref1, ref2, blend );

		outColor = mix(
			outColor + ref * mat.metalness,
			ref,
			EF
		);

	#elif defined( USE_ENV_MAP )
	
		vec3 env = mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * envMapIntensity;
	
		outColor = mix(
			outColor + env * mat.metalness,
			env,
			EF
		);
	
	#endif

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