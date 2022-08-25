uniform sampler2D tex;
uniform float uSectionVisibility;
varying vec2 vUv;
varying float vAlpha;

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;

#endif

#include <packing>

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec4 col = texture2D( tex, vUv );

	if( col.w < 0.5 ) {

		discard;
		
	}

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
	
	#endif

	// col.w *= vAlpha * uSectionVisibility;

	col.xyz *= 1.0 - random(gl_FragCoord.xy * 0.001) * 0.08;

	gl_FragColor = col;

}