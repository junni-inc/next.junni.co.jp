varying float vNum;
varying float vAlpha;

uniform float uVisibility;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	if( step( 1.0, length( cuv ) ) == 1.0 ) {

		discard;
		
	}

	float alpha = 1.0;

	alpha *= step( length( cuv ), 0.9 ) * 0.9;
	// alpha *= step( length( cuv ), 0.9 );

	gl_FragColor = vec4( vec3( 1.0 ), uVisibility * alpha );

}