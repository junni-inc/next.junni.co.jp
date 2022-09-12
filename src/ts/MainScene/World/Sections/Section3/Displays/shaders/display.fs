
varying vec2 vUv;
varying vec2 vUv2;
varying float vBrightness;
varying float vFade;
varying vec3 vNormal;
varying vec3 vViewPos;

uniform float time;
uniform float uTimeMod;
uniform sampler2D uNoiseTex;
uniform sampler2D uDisplayTex;

uniform float uSectionVisibility;

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = vec3( 1.0 );
	vec2 texUv = vUv2;

	vec2 n = vec2( (texture2D( uNoiseTex, vec2( vUv2.y * 2.0, time * 3.0 ) ).x - 0.5) * 0.5, 0.0 );
	n *= vFade;
	n.x -= ( texture2D( uNoiseTex, vec2( vUv2.y * 50.0, time * 3.0 ) ).x - 0.5 )  * 0.05;

	vec2 texUvR = texUv + n;
	vec2 texUvG = texUv + n * 0.5;
	vec2 texUvB = texUv + n * 1.0;

	vec4 logo = vec4( 0.0 );
	logo.xw += texture2D( uDisplayTex, texUvR ).xw;
	logo.yw += texture2D( uDisplayTex, texUvG ).yw;
	logo.zw += texture2D( uDisplayTex, texUvB ).zw;
	logo.w /= 3.0;
	color = mix( color, logo.xyz, logo.w );

	vec3 noiseColor = vec3( 0.0 ) + random( vUv + mod(time, 1.0) + 1000.0 );

	// ノイズとロゴのきりかえ
	float logoW = smoothstep( 0.0, 0.2, -texture2D( uNoiseTex, vec2( vUv2.y + time * 10.0, 0.0 ) ).x + vBrightness * 1.2 );
	color = mix( noiseColor, color, logoW );

	// 周辺減光的な
	color *= smoothstep( 1.0, 0.3, length( vUv - 0.5 ) );

	// なみなみ
	color *= 0.78 - sin( vUv.y * 200.0 - time * 10.0 ) * 0.02;

	// ビカビカ
	color *= step( 0.0, sin( vUv2.y * 5.0 - time * 80.0 ) ) * 0.05 + 0.95;

	gl_FragColor = vec4( color, uSectionVisibility );

}