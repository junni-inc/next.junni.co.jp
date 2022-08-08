varying vec2 vUv;
varying vec2 vUv2;
varying	float vBrightness;

uniform vec2 uv2;
uniform float time;

uniform sampler2D uNoiseTex;

#ifdef IS_ADAPTER

	varying vec3 vNormal;
	varying vec4 vWorldPos;

#endif

void main( void ) {

	vec3 pos = position;

	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vUv2 = uv2;

	vec4 noise = texture2D( uNoiseTex, vec2( time * 0.5 + modelMatrix[3][0] ) );
	
	vBrightness = 0.0;
	vBrightness += smoothstep( 0.0, 0.4, noise.x ) * 0.9;
	vBrightness *= 1.0 - abs( vUv.x - 0.5 ) * 2.0;

	#ifdef IS_ADAPTER

		vNormal = normalMatrix * normal;
		vWorldPos = worldPos;
		
	#endif

}