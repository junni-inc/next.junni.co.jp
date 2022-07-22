varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D bloomTexs[RENDER_COUNT];
uniform sampler2D noiseTex;
uniform float brightness;
uniform float time;

#pragma glslify: random = require( './random.glsl' );

void main(){

	vec3 c = vec3( 0.0 );

	vec2 uv = vUv;
	vec2 cuv = vUv * 2.0 - 1.0;
	float w = max( .0, length( cuv ) ) * 0.02;

	float slide;
	vec2 rUV;
	vec2 gUV;
	vec2 bUV;

	#pragma unroll_loop_start
	for ( int i = 0; i < 3; i ++ ) {
		
		slide = float( UNROLLED_LOOP_INDEX ) / 5.0;

		rUV = uv + vec2( 0.0, 0.0 ) * slide;
		gUV = uv + vec2( 0.0025, 0.0 ) * slide;
		bUV = uv + vec2( 0.005, 0.0 ) * slide;

		c.x += texture2D(sceneTex, rUV ).x;
		c.y += texture2D(sceneTex, gUV ).y;
		c.z += texture2D(sceneTex, bUV ).z;

	}
	#pragma unroll_loop_end
	c /= float( 3 );
	
	#pragma unroll_loop_start
	for ( int i = 0; i < RENDER_COUNT; i ++ ) {
		
		c += texture2D( bloomTexs[ UNROLLED_LOOP_INDEX ], vUv ).xyz * pow( 2.0, float( UNROLLED_LOOP_INDEX ) ) * brightness;

	}
	#pragma unroll_loop_end

	c += random( uv ) * 0.1 * c;

	c *= smoothstep( -1.5, 0.5, 1.0 - length( cuv ) );

	gl_FragColor = vec4( c, 1.0 );

}