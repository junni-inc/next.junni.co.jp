
varying vec2 vUv;
varying float vBrightness;

uniform float time;
uniform float uTimeMod;

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = vec3( vBrightness );
	color *= smoothstep( 2.0, 0.0, length( vUv - 0.5 ) );
	color -= random(vUv + uTimeMod) * 0.15;
	color *= 1.0 - (sin( vUv.y * 200.0 - time * 10.0 ) * 0.5 + 0.5) * 0.02;

	gl_FragColor = vec4( color, 1.0 );

}