
varying float vRnd;
varying float vAlpha;
varying vec2 vUv;

void main( void ) {

	vec4 color = vec4( 1.0 );

	if( vUv.x < 0.0 * (vRnd * (0.9 + 0.1)) ) discard; 
	
	if( color.w < 0.2 ) discard;
	
	color.w *= vAlpha;

	gl_FragColor = vec4( color );

}