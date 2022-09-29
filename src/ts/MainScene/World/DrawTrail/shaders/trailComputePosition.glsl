uniform vec2 dataSize;
uniform sampler2D uPosDataTex;
uniform sampler2D uNoiseTex;
uniform float time;
uniform float uMaterial[6];
uniform vec3 uCursorPos;

#pragma glslify: rotate = require('./rotate.glsl' )

void main() {

    if( gl_FragCoord.x <= 1.0 ) {
		
        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        gl_FragColor = vec4( uCursorPos, 1.0 );
        
    } else {

        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        vec2 bUV = ( gl_FragCoord.xy - vec2( 1.0, 0.0 ) ) / dataSize.xy;

        vec3 pos = texture2D( uPosDataTex, uv ).xyz;
        vec3 beforePos = texture2D( uPosDataTex, bUV ).xyz;
		
		float blend = 0.0;
		blend += uMaterial[0] * 0.4;
		blend += uMaterial[1] * 0.2;
		blend += uMaterial[2] * 0.3;
		blend += uMaterial[4] * 0.1;
		blend += uMaterial[5] * 0.2;

		vec3 newPos = mix(beforePos, pos, blend);

		// sec4 床むりやりやぞ
		
		newPos -= -12.0;
		newPos.y *= 1.0 - 0.1 * uMaterial[3];
		newPos += -12.0;

		// sec5 ノイズ
		
		newPos.xyz += ( texture2D( uNoiseTex, pos.xy * 0.02 ).xyz - 0.50 ) * 0.05 * uMaterial[4];

		// sec6 進むやつ

		newPos += uMaterial[5] * vec3( 0.1, -.06, 0.1 );

        gl_FragColor = vec4(newPos,1.0);
    }
}