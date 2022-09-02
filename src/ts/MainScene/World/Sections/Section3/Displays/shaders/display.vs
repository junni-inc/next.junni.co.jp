varying vec2 vUv;
varying vec2 vUv2;
varying	float vBrightness;
varying float vCount;
varying float vFade;

varying vec3 vNormal;
varying vec3 vViewPos;

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

	float t = time + uOffset * 0.1;
	vCount = floor(t / 1.0);
	vFade = smoothstep( 0.85, 1.0, mod(t, 1.0) );

	vUv = uv;
	vUv.y = 1.0 - vUv.y;
	vUv2 = spriteUVSelector( vUv, vec2( 2.0, 4.0 ), 8.0, vCount / 8.0 );

	float noise = texture2D( uNoiseTex, vec2( time * 0.03 + modelMatrix[3][0] ) ).x;
	float noiseHigh = texture2D( uNoiseTex, vec2( time * 3.0 + modelMatrix[3][0] ) ).x;
	vBrightness = smoothstep( 0.54, 0.55, noise + noiseHigh * 0.08 ) * 0.9;

	vFade += smoothstep( 0.4, 1.0, sin( vBrightness * PI ) );

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPos = -mvPosition.xyz;

}