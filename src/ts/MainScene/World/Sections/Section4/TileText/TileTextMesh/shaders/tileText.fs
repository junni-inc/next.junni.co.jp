uniform sampler2D uTex;
varying vec2 vUv;

#include <packing>

#ifdef IS_DEPTH

	varying vec2 vHighPrecisionZW;
	
#endif

void main( void ) {

	vec4 col = texture2D( uTex, vUv );

	if( col.w < 0.5 ) discard;

	#ifdef IS_DEPTH

		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
		
	#endif

	#ifdef IS_BG

		gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
		return;

	#else

		if( col.x > 0.0 ) {

			gl_FragColor = vec4( 1.0 );
			return;
			
		} else if( col.y > 0.0 ) {

			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
			return;
			
		} else if( col.z > 0.0 ) {
			
			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
			return;
			
		}

	#endif

	discard;

}