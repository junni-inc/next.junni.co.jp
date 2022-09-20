uniform sampler2D tex;
uniform sampler2D noiseTex;

uniform float uSectionVisibility;
uniform float time;

varying vec2 vBaseUV;
varying vec2 vUv;
varying float vAlpha;
varying float vType;
varying vec2 vComputeUV;

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;

#endif

#include <packing>

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec4 human = texture2D( tex, vUv );

	if( human.w < 0.5 ) {

		discard;
		
	}

	float rnd = ( 0.5 + vComputeUV.y * 0.5 );
	vec2 cUv = ( vBaseUV - 0.5 ) * 2.0;
	float wave = vBaseUV.y * 80.0 * rnd - time * 10.0;

	vec3 col1 = vec3( smoothstep( 0.4, 0.6, texture2D( noiseTex, floor( ( vBaseUV ) * 5.0) / 5.0  + vec2( time * 0.1, vComputeUV.y ) ).x ) );
	vec3 col2 = vec3( step( sin( wave ), 0.0 ) );
	vec3 col3 = vec3( smoothstep( 0.4, 0.6, smoothstep( 0.3, 0.7, texture2D( noiseTex, ( vBaseUV * 0.4 * rnd )  + vec2( time * 0.1, vComputeUV.y ) ).x ) ) );
	vec3 col4 = vec3( 1.0, 1.0, 1.0 );

	vec3 col = vec3(0.0);
	col.xyz = mix( col, col1, ( 1.0 - min( 1.0, abs( vType - 0.0 ) ) ) );
	col.xyz = mix( col.xyz, col2, ( 1.0 - min( 1.0, abs( vType - 1.0 ) ) ) );
	col.xyz = mix( col.xyz, col3, ( 1.0 - min( 1.0, abs( vType - 2.0 ) ) ) );
	col.xyz = mix( col.xyz, col4, ( 1.0 - min( 1.0, abs( vType - 3.0 ) ) ) );

	human.xyz = mix( human.xyz, col, human.x - human.y );

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
	
	#endif

	// col.w *= vAlpha * uSectionVisibility;

	human.xyz *= 1.0 - random(gl_FragCoord.xy * 0.001) * 0.08;

	gl_FragColor = human;

}