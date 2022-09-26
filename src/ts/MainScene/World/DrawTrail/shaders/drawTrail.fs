varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

uniform vec3 uColor;
uniform samplerCube uEnvMap;

uniform float uMaterial[6];

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
uniform vec2 uWinResolution;

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
	vec3 emission;
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

#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif

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
	
	float f0 = 0.15;

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
	// c = mix( c, vec3( 1.0 ), uLine);

	return c;

}

/*-------------------------------
	HSV
-------------------------------*/

vec3 hsv2rgb( vec3 hsv ){

	return ((clamp(abs(fract(hsv.x+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*hsv.y+1.)*hsv.z;

}

/*-------------------------------
	Main
-------------------------------*/

void main( void ) {

	/*-------------------------------
		Material
	-------------------------------*/

	Material mat;
	mat.opacity = 1.0;
	mat.roughness = 0.1;
	mat.metalness = 0.0;

	// albedo
	
	mat.albedo = vec3( 0.0, 0.0, 0.0 );
	mat.albedo += hsv2rgb( vec3( time * 0.1 + vUv.y * 0.1 + 0.1, 1.0, 1.0 ) ) * uMaterial[0];
	// mat.albedo += vec3( 1.0, 0.0, 0.0 ) * uMaterial[3];

	// emission

	mat.emission += mat.albedo * 0.9 * uMaterial[0];
	mat.emission += vec3( 1.0 ) * uMaterial[2];
	mat.emission += vec3( 0.1, 0.0, 0.0 ) * uMaterial[3];
	mat.emission += vec3( 0.5 ) * uMaterial[4];
	mat.emission += vec3( 1.0 ) * uMaterial[5];

	#ifdef USE_ALPHA_MAP

		mat.opacity = texture2D( alphaMap, vUv ).x;

	#else

		mat.opacity *= opacity;

	#endif
	
	// if( mat.opacity < 0.5 ) discard;

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	// output
	vec3 outColor = vec3( 0.0 );
	float outOpacity = mat.opacity;

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

	/*-------------------------------
		Refract
	-------------------------------*/

	vec3 refractCol = vec3( 0.0 );
	vec2 screenUv = gl_FragCoord.xy / uWinResolution.xy;
	vec2 refractUv = screenUv;
	float slide;
	vec2 refractUvR;
	vec2 refractUvG;
	vec2 refractUvB;
	float refractPower = 0.1;
	vec2 refractNormal = geo.normal.xy * ( 1.0 - geo.normal.z * 0.9 );
	
	#pragma unroll_loop_start

	for ( int i = 0; i < 16; i ++ ) {
		
		slide = float( UNROLLED_LOOP_INDEX ) / 16.0 * 0.03 + random( screenUv ) * 0.007;

		refractUvR = refractUv - refractNormal * ( refractPower + slide * 1.0 );
		refractUvG = refractUv - refractNormal * ( refractPower + slide * 2.0 );
		refractUvB = refractUv - refractNormal * ( refractPower + slide * 3.0 );

		refractCol.x += texture2D( uSceneTex, refractUvR ).x;
		refractCol.y += texture2D( uSceneTex, refractUvG ).y;
		refractCol.z += texture2D( uSceneTex, refractUvB ).z;

	}
	#pragma unroll_loop_end
	refractCol /= float( 16 );

	outColor += (refractCol) * hsv2rgb(vec3( time * 0.05, 1.0, 1.0 ) ) * uMaterial[1];

	/*-------------------------------
		Specular
	-------------------------------*/
	Light light;

	float lw;
	lw += uMaterial[0];
	lw += uMaterial[3];

	#if NUM_DIR_LIGHTS > 0

		float shadow;

		#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

				light.direction = directionalLights[ i ].direction;
				light.color = directionalLights[ i ].color;
				shadow = 1.0;

				outColor += RE( geo, mat, light ) * shadow * lw;
				
			}
		#pragma unroll_loop_end

	#endif

	/*-------------------------------
		Envmap
	-------------------------------*/

	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float EF = fresnel( dNV );
	
	vec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );
	refDir.x *= -1.0;
	
	vec3 envMapColor = textureCube( uEnvMap, refDir ).xyz;

	// outColor += envMapColor * EF;
	outColor += mat.emission;

	gl_FragColor = vec4( outColor, 1.0 );

}