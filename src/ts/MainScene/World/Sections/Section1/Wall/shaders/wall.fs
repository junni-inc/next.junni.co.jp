uniform sampler2D tex;
uniform sampler2D uNoiseTex;
uniform float uVisibility;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying float vTexBlend;
uniform vec3 velocity;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

void main( void ) {

	vec3 sceneCol = texture2D( tex, vUv ).xyz;

	vec4 n1 = texture2D( uNoiseTex, vUv * 0.05 + time * 0.01);
	vec4 noise = texture2D( uNoiseTex, vUv * 0.3 + n1.xy * 0.1 );
	vec3 noiseCol = hsv2rgb( vec3( 0.2 + noise.x * 0.9, smoothstep( 0.2, 0.70, noise.z ) * 0.9, 1.0 ) ) * 1.8;

	vec3 col = mix( noiseCol, sceneCol, vTexBlend );

	// col = noiseCol;	

	vec3 normal = normalize( vNormal );

	vec3 outCol = col;

	gl_FragColor = vec4( outCol, 1.0 );

}