
varying vec2 vUv;
varying float vBrightness;

uniform float time;
uniform float uTimeMod;
uniform float uVisibility;

#pragma glslify: random = require('./random.glsl' )

#ifdef IS_ADAPTER

	varying vec3 vNormal;
	varying vec4 vWorldPos;
	uniform samplerCube uEnvMap;

#endif

void main( void ) {

	#ifdef IS_ADAPTER

		vec3 normalWorld =  normalize( ( vec4( vNormal, 0.0 ) * viewMatrix ).xyz );
		vec3 viewDirWorld = normalize( vWorldPos.xyz - cameraPosition );

		vec3 refDir = reflect( viewDirWorld, normalWorld );
		refDir.x *= -1.0;
	
		vec3 envMapColor = textureCube( uEnvMap, refDir ).xyz;
		vec3 color = envMapColor * 0.2;

		gl_FragColor = vec4( color, uVisibility );

		return;

	#else

		vec3 color = vec3( 1.0 ) * vBrightness;
		
		gl_FragColor = vec4( color, uVisibility );

	#endif

}