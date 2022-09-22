uniform vec2 dataSize;
uniform sampler2D uPosDataTex;
uniform float time;
uniform vec3 uCursorPos;

void main() {
    if( gl_FragCoord.x <= 1.0 ) {
		
        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        vec3 pos = texture2D( uPosDataTex, uv ).xyz;

        pos = uCursorPos;

        gl_FragColor = vec4( pos, 1.0 );
        
    } else {

        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        vec2 bUV = ( gl_FragCoord.xy - vec2( 1.0, 0.0 ) ) / dataSize.xy;

        vec3 pos = texture2D( uPosDataTex, uv ).xyz;
		
        vec3 beforePos = texture2D( uPosDataTex, bUV ).xyz;
		
        gl_FragColor = vec4(mix(beforePos, pos, 0.2) ,1.0);
    }
}