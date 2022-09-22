uniform float time;
varying vec2 vUv;

#pragma glslify: import('./constants.glsl' )

void main( void ) {

	vec3 c = vec3( 
		sin( vUv.y * PI + 0.0 ),
		sin( vUv.y * PI + 0.3 ),
		sin( vUv.y * PI + 0.6 )
	);

	float alpha = sin( vUv.y * PI);

	gl_FragColor = vec4( c, alpha );

}