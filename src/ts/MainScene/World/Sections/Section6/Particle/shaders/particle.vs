attribute float num;
uniform float time;
uniform vec3 range;
uniform float contentNum;
uniform float particleSize;
varying float vNum;
varying float vAlpha;

void main( void ) {

	vec3 pos = position;
	float t = time * 0.5;

	pos += vec3( 
		t * 4.0 + sin( t + ( position.y + position.z ) * 10.0 ) * 0.3,
		0.0,
		0.0
	);

	vec3 hrange = range / 2.0;

	pos = mod( pos, range );
	pos -= range / 2.0;
	
	vAlpha = smoothstep( hrange.z, hrange.z - 0.5, abs( pos.z ) );
	vAlpha *= smoothstep( hrange.y, hrange.y - 0.5, abs( pos.y ) );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = ( 5.0 * (smoothstep( -10.0, 0.0, mvPosition.z ) + 0.1 ) ) * particleSize;

	vNum = num;

}