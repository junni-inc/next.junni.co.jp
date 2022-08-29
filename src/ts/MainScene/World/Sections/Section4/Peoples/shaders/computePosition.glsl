uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

void main() {
	vec2 uv = gl_FragCoord.xy / dataSize.xy;
	vec3 pos = texture2D( dataPos, uv ).xyz;
	vec3 vel = texture2D( dataVel, uv ).xyz;

	pos += vel;
	gl_FragColor = vec4(pos,1.0);
}