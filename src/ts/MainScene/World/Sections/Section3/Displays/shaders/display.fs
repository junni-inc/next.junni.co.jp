
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

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = vec3( 1.0 );

	vec2 texUv = vUv2;

	vec2 n = vec2( (texture2D( uNoiseTex, vec2( vUv2.y * 3.0, time * 3.0 ) ).x - 0.5) * 0.5, 0.0 );
	n *= vFade;

	vec2 texUvR = texUv + n;
	vec2 texUvG = texUv + n * 0.5;
	vec2 texUvB = texUv + n * 0.2;

	vec4 message = vec4( 0.0 );
	message.xw += texture2D( uDisplayTex, texUvR ).xw;
	message.yw += texture2D( uDisplayTex, texUvG ).yw;
	message.zw += texture2D( uDisplayTex, texUvB ).zw;
	message.w /= 3.0;

	color = mix( color, message.xyz, message.w );
	color = mix( vec3( random(vUv + uTimeMod) ), color, vBrightness );
	color *= smoothstep( 2.0, 0.0, length( vUv - 0.5 ) );
	color *= 0.8 - (sin( vUv.y * 200.0 - time * 10.0 ) * 0.5 + 0.5) * 0.08;

	// color *= (step( 0.5, mod(vUv2.x * 200.0, 1.0) ) * step( 0.5, mod(vUv2.y * 200.0, 1.0 ) )) * 0.1 + 0.9;

	// vec3 viewDir = normalize( vViewPos );
	// vec3 normal = normalize( vNormal );
	
	// float dNV = clamp( dot(normal, viewDir ), 0.0, 1.0 );
	// float EF = dNV;
	// float EF = mix( fresnel( dNV ), 1.0, mat.metalness );

	// color *= smoothstep( 0.0, 1.0, EF );

	gl_FragColor = vec4( color, 1.0 );

}