uniform float time;
uniform float seed;
uniform float deltaTime;

uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: snoise = require('./noise4D.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main() {
    
    vec2 uv = gl_FragCoord.xy / dataSize.xy;
    vec3 pos = texture2D( dataPos, uv ).xyz;
    vec3 vel = texture2D( dataVel, uv ).xyz;
    float idParticle = uv.y * dataSize.x + uv.x;
	
    float scale = 0.3 + sin( time ) * 0.2;
	vec3 p = scale * pos.xyz ;
    
    vel.xyz += vec3(
      snoise( vec4( p, 7.225 + time * 0.5 )  ),
      snoise( vec4( p, 3.553 + time * 0.5 )  ),
      snoise( vec4( p, 1.259 + time * 0.5 )  )
    ) * deltaTime * 30.0;

	//gravity
	vec3 objPos = vec3( 0.0, 0.0, 0.0 );
    vec3 gpos = pos - objPos;

	vec3 baseVel = vec3( 0.0 );
	baseVel.xz += smoothstep( 2.5, 1.5, length( pos.xz ) + uv.y ) * ( pos.xz ) * 10.0;
    baseVel += -( gpos ) * length(gpos) * 0.000001;

	vel += baseVel;
    vel.xyz *= 0.95 - uv.y * 0.02;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );
}