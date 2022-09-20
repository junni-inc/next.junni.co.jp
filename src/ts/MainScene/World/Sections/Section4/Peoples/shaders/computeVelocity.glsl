uniform float time;
uniform float seed;
uniform float deltaTime;

uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;
uniform vec3 uModelPosition;
uniform float uJumping;
uniform float uTextSwitch;
uniform vec3 uCursorPos;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: snoise = require('./noise4D.glsl' )
#pragma glslify: random = require('./random.glsl' )

struct AvoidObj {
	vec3 position;
	vec3 scale;
};

uniform AvoidObj uAvoid[AVOID_COUNT];

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

void main() {
    
    vec2 uv = gl_FragCoord.xy / dataSize.xy;
    vec3 pos = texture2D( dataPos, uv ).xyz;
    vec3 vel = texture2D( dataVel, uv ).xyz;
    float idParticle = uv.y * dataSize.x + uv.x;
	
	// noise的な動き

    float scale = 0.7 + sin( time ) * 0.1;
	vec3 p = scale * pos.xyz;
	p.z += uv.y * 100.0;

    vel.xz += vec2(
      snoise( vec4( p, 7.225 + time * 0.5 )  ),
      snoise( vec4( p, 3.553 + time * 0.5 )  )
    ) * deltaTime * 2.0;

	// 避け

	AvoidObj avoid;
	vec3 avoidVel = vec3( 0.0 );
	vec2 avoidDiff = vec2( 0.0 );

	#pragma unroll_loop_start
	for ( int i = 0; i < AVOID_COUNT; i ++ ) {		

		avoid = uAvoid[ UNROLLED_LOOP_INDEX ];
		avoidDiff = pos.xz - (avoid.position.xz - uModelPosition.xz);
		avoidDiff /= avoid.scale.xz; 
		avoidVel.xz += smoothstep( 0.5, 0.4, length( avoidDiff ) + uv.y * 0.05 ) * ( avoidDiff ) * ( 1.0 - uJumping);
		
	}
	#pragma unroll_loop_end

	vel += avoidVel;

	// 中央へ寄る (なんかほっとくと右下行くから補正かけてる)
	vec2 centerGravity = vec2( 0.0 ) - pos.xz - vec2( 1.2, 4.0 );
	vel.xz += ( centerGravity ) * length(centerGravity) * 0.00003;

	vel.xz = normalize( vel.xz ) * 0.02;

	// 衝撃波

	float wave = smoothstep( 0.9, 1.0, sin( linearstep( 0.0, 1.0, -length( pos.xz ) * 0.1 + uTextSwitch * 3.0) * PI - uv.x * 1.0 ) );
	wave *= 0.8 + max( 0.0, 1.0 - length( pos.xz ) * 0.1 ) * 0.5;
	vel += normalize( pos ) * 0.08 * wave;

	// 重力 / 衝撃波

	if( p.y <= 0.0 ) {

		vel.y = 0.0;

	} else {

		vel.y -= 1.0 * deltaTime;

	}

	vel.y += wave * 0.05;

	// マウスを避ける

	vec2 diffCursor = pos.xz - uCursorPos.xz;
	vel.xz += smoothstep( 2.0, 0.0, length( diffCursor ) ) * diffCursor * 0.1;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );

}