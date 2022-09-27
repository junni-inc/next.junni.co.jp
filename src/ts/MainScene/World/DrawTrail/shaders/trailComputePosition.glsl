uniform vec2 dataSize;
uniform sampler2D uPosDataTex;
uniform sampler2D uNoiseTex;
uniform float time;
uniform vec3 uCursorPos;
uniform float uMaterial[6];
uniform vec3 uOrigin;
#pragma glslify: rotate = require('./rotate.glsl' )

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
		
		float blend = 0.0;
		blend += uMaterial[0] * 0.4;
		blend += uMaterial[1] * 0.4;
		blend += uMaterial[2] * 0.3;
		blend += uMaterial[4] * 0.1;
		blend += uMaterial[5] * 0.2;

		vec3 newPos = mix(beforePos, pos, blend);
		newPos += uMaterial[5] * vec3( 0.1, -.06, 0.1 );

		newPos -= uOrigin;
		// newPos.xz *= rotate( 0. * uMaterial[2] );
		// newPos.y += ( 0.008 * uMaterial[2] );
		// newPos *= 0.99;
		newPos.xyz += ( texture2D( uNoiseTex, pos.xy * 0.02 ).xyz - 0.50 ) * 0.05 * uMaterial[4];
		// newPos.xyz += ( texture2D( uNoiseTex, pos.xy * 0.1 + vec2( time * 0.03, 0.0 ) ).xyz - 0.50 ) * 0.07 * uMaterial[2];
		newPos += uOrigin;

		// newPos.xy *= rotate( 0.001 );
		
        gl_FragColor = vec4(newPos,1.0);
    }
}