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
	
    float scale = 0.6 + sin( time ) * 0.1;
	vec3 p = scale * pos.xyz;
    
    vel.xyz += vec3(
      snoise( vec4( p, 7.225 + time * 0.5 )  ),
      snoise( vec4( p, 3.553 + time * 0.5 )  ),
      snoise( vec4( p, 1.259 + time * 0.5 )  )
    ) * deltaTime * 2.0;

	vec3 gravity = vec3( 0.0 ) - pos;
	vec3 baseVel = vec3( 0.0 );
	vec2 avoidDiff = vec2( 0.0 );
	AvoidObj avoid;

	#pragma unroll_loop_start
	for ( int i = 0; i < AVOID_COUNT; i ++ ) {		

		avoid = uAvoid[ UNROLLED_LOOP_INDEX ];
		avoidDiff = pos.xz - (avoid.position.xz - uModelPosition.xz);
		avoidDiff /= avoid.scale.xz; 
		baseVel.xz += smoothstep( 0.5, 0.4, length( avoidDiff ) + uv.y * 0.05 ) * ( avoidDiff ) * ( 1.0 - uJumping);
		
	}
	#pragma unroll_loop_end


	vel += baseVel;
    vel.xyz *= 0.99 - uv.y * 0.02;
	vel += ( gravity ) * length(gravity) * 0.00005;

	vel = normalize( vel ) * 0.02;
	vel += normalize( pos ) * 0.03 * sin( linearstep( 0.0, 1.0, -length( pos.xz ) * 0.1 + uTextSwitch * 3.0) * PI );

	vec2 diffCursor = pos.xz - uCursorPos.xz;
	vel.xz += smoothstep( 2.0, 0.0, length( diffCursor ) ) * diffCursor * 0.1;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );
}