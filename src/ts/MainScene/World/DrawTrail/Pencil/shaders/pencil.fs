uniform sampler2D uTex;
varying vec2 vUv;

#include <packing>

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;

#endif

void main( void ) {

	vec4 color = texture2D( uTex, vUv );
	if( color.w < 0.5 ) discard;

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
	
	#endif


	gl_FragColor = color;

}