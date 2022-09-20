uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

void main() {
	vec2 uv = gl_FragCoord.xy / dataSize.xy;
	vec4 pos = texture2D( dataPos, uv );
	vec4 vel = texture2D( dataVel, uv );

	pos += vel;
	pos.y = max( 0.0, pos.y );
	
	gl_FragColor = vec4(pos.xyz, mod( pos.w + 0.01, 1.0 ) );
}