varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

uniform samplerCube uEnvMap;

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

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

float fresnel( float d ) {
	
	float f0 = 0.15;

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );

}

/*-------------------------------
	Main
-------------------------------*/

void main( void ) {

	/*-------------------------------
		Material
	-------------------------------*/

	Material mat;
	
	mat.albedo = vec3( 1.0, 1.0, 1.0 );

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
	vec2 screenUv = gl_FragCoord.xy / winResolution.xy;
	vec2 refractUv = screenUv;
	float slide;
	vec2 refractUvR;
	vec2 refractUvG;
	vec2 refractUvB;
	float refractPower = 0.1;
	
	outColor += (vec3( 0.5 ));

	/*-------------------------------
		Envmap
	-------------------------------*/

	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float EF = fresnel( dNV );
	
	outColor += EF * 2.0;

	gl_FragColor = vec4( outColor, 1.0 );

}