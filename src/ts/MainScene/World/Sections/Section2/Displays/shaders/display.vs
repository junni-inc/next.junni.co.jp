varying vec2 vUv;
varying vec2 vUv2;
varying	float vBrightness;

uniform vec2 uv2;
uniform float time;
uniform sampler2D uNoiseTex;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vUv2 = uv2;

	vec4 noise = texture2D( uNoiseTex, vec2( time * 0.5 + modelMatrix[3][0] ) );
	vBrightness = 0.0;
	vBrightness += smoothstep( 0.0, 0.4, noise.x ) * 0.9;
	// vBrightness += step( 0.65, noise.y ) * 0.8;

}