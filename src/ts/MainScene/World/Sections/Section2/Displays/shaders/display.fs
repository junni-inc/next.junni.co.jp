uniform sampler2D uNoiseTex;
uniform float time;

varying vec2 vUv;

void main( void ) {

	vec4 noise = texture2D( uNoiseTex, vec2( time) );
	float brightness = noise.x;

	gl_FragColor = vec4( vec3( brightness ), 1.0 );

}