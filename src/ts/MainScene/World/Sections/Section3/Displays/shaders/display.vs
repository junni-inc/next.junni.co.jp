varying vec2 vUv;
varying vec2 vUv2;
varying	float vBrightness;
varying float vFade;

varying vec3 vNormal;
varying vec3 vViewPos;
varying float vInvert;

uniform vec2 uv2;
uniform float time;
uniform sampler2D uNoiseTex;
uniform float uOffset;

#pragma glslify: import('./constants.glsl' )

vec2 spriteUVSelector( vec2 uv, vec2 tile, float frames, float time ) {

	float t = floor(frames * mod( time, 1.0 ) );

	uv.x += mod(t, tile.x);
	uv.y -= floor(t / tile.x);

	uv.y -= 1.0;
	uv /= tile;
	uv.y += 1.0;
	
	return uv;
	
}

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vUv.y = 1.0 - vUv.y;
	vUv2 = spriteUVSelector( vUv, vec2( 2.0, 4.0 ), 8.0, uOffset / 8.0 );

	vec2 noise = texture2D( uNoiseTex, vec2( time * 0.03 + modelMatrix[3][0] ) ).xy;
	vec2 noiseHigh = texture2D( uNoiseTex, vec2( time * 3.0 + modelMatrix[3][0] ) ).xy;
	vBrightness = smoothstep( 0.55, 0.65, noise.x + noiseHigh.x * 0.08 ) * 0.9;
	vInvert = step( 0.5, noise.y + noiseHigh.y * 0.08 );

	vFade = sin( vBrightness * PI ) + sin( vInvert * PI);

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPos = -mvPosition.xyz;

}