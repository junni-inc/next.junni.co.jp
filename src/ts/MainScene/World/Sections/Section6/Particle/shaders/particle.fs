varying float vNum;
varying float vAlpha;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	if( step( 0.5, length( cuv ) ) == 1.0 ) {

		discard;
		
	}

	gl_FragColor = vec4( vec3( 1.0 ), 1.0 );

}