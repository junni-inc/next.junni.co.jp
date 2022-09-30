
varying vec2 vUv;
varying vec2 vUv2;
varying float vBrightness;
varying float vFade;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vInvert;

uniform float time;
uniform float uTimeMod;
uniform sampler2D uNoiseTex;
uniform sampler2D uDisplayTex;
uniform float uRaymarchEffect;

uniform float uSectionVisibility;

#pragma glslify: random = require( './random.glsl' )
#pragma glslify: rotate = require( './rotate.glsl' )

#ifdef IS_RAYMARCH 

	float sdBox( vec3 p, vec3 b )
	{
		vec3 q = abs(p) - b;
		return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
	}

	float sdSphere( vec3 p, float s )
	{
		return length(p)-s;
	}

#endif

#ifdef IS_RAYMARCH_1

	float SDF( vec3 p ){

		p.xy *= rotate( p.z * 0.05 + uRaymarchEffect * 5.0 );
		
		vec3 loopP = mod( p, 4.0 ) - 2.0;
		
		loopP.yz *= rotate( uRaymarchEffect * 10.0 + time );
		loopP.xz *= rotate( uRaymarchEffect * 10.0 );

		vec3 size = vec3( 0.3, 0.3 + uRaymarchEffect * 3.0, 0.3 );
		size *= 1.0 - uRaymarchEffect * 0.5;

		float d = sdBox( loopP, size );
		
		return d;
	}

#endif

#ifdef IS_RAYMARCH_2

	float SDF( vec3 p ){

		vec3 p1 = p + vec3( sin( time ) * 0.1, cos( time ) * 0.1, 0.0 );

		float sph = sdSphere( p1, 1.0 );

		float d = min( sph, 999.0 );
		
		return d;
	}

#endif

#ifdef IS_RAYMARCH 

	vec3 getNormal( vec3 p ){

		float delta = 0.001;
		vec3 dx = vec3( delta,0.0,0.0 );
		vec3 dy = vec3( 0.0,delta,0.0 );
		vec3 dz = vec3( 0.0,0.0,delta );
		vec3 result;
		result.x = SDF( p + dx ) - SDF( p - dx );
		result.y = SDF( p + dy ) - SDF( p - dy );
		result.z = SDF( p + dz ) - SDF( p - dz );
		
		return normalize( result );
	}

#endif

void main( void ) {

	vec3 color = vec3( .0 );
	vec2 texUv = vUv2;

	vec2 n = vec2( ( texture2D( uNoiseTex, vec2( vUv2.y * 2.0, time * 3.0 ) ).xy - 0.5 ) * 0.5 );
	n *= vFade;
	n.x -= ( texture2D( uNoiseTex, vec2( vUv2.y * 50.0, time * 3.0 ) ).x - 0.5 ) * 0.05;

	vec2 texUvR = texUv + n;
	vec2 texUvG = texUv + n * 0.5;
	vec2 texUvB = texUv + n * 1.0;

	#ifdef IS_RAYMARCH
	
		float fov = 50.0;
	

		#ifdef IS_RAYMARCH_1
		
			vec3 cPos = vec3( 0.0, 0.0, -time * 10.0 );
			cPos.x = cos(time * 0.5) * 1.0;
			cPos.y = sin(time) * 1.2;
			cPos.z -= n.y * 3.0;

		#endif

		#ifdef IS_RAYMARCH_2
		
			vec3 cPos = vec3( 0.0, 0.0, 0.0 );

		#endif

		vec2 pos = vUv.xy * 2.0 - 1.0;
		pos.x += n.y * 2.0;
		vec3 ray = normalize( vec3( sin( fov ) * pos.x, sin( fov ) * pos.y, -1.0 ) );
		
		float rDistance = 0.0;
		float rLen = 0.0;
		
		vec3 rPos = cPos;
		float hit = 0.0;
		
		for( int i = 0; i < 40; i++ ){
			
			rDistance = SDF( rPos );
			rLen += rDistance;
			rPos = cPos + ray * rLen;

			if( abs( rDistance ) <= 0.01 ){

				vec3 normal = getNormal( rPos );
				float diff = clamp( dot( vec3( 0.5,0.5,0.5 ), normal ), 0.1, 1.0 );

				color = mix( vec3( diff ), normal * 0.5 + 0.5, vInvert * 0.9 );

				hit = 1.0;
				
				break;

			}
			
		}

		color = mix( vec3( vInvert ), color, hit );

	#else

		vec4 logo = vec4( 0.0 );
		logo.xw += texture2D( uDisplayTex, texUvR ).xw;
		logo.yw += texture2D( uDisplayTex, texUvG ).yw;
		logo.zw += texture2D( uDisplayTex, texUvB ).zw;
		logo.w /= 3.0;
		
		color = mix( vec3( 1.0 ), logo.xyz, logo.w );

	#endif

	vec3 noiseColor = vec3( 0.0 ) + random( vUv + mod( time, 1.0 ) + 1000.0 ) * 0.7;
	noiseColor += step( 0.0, sin( time * 3.0 - vUv2.y ) * sin( time * 3.0 - vUv.y * 8.0 )) * 0.1;

	// ノイズとロゴのきりかえ
	float noiseW = smoothstep( 0.00, 0.01, -texture2D( uNoiseTex, vec2( vUv2.y + time * 10.0, 0.0 ) ).x + vBrightness * 1.2 );
	color = mix( color, noiseColor, noiseW );

	// ビカビカ
	color *= step( 0.0, sin( vUv2.y * 5.0 - time * 80.0 ) ) * 0.05 + 0.95;
	
	// 反転
	color = mix( color, 1.0 - color, vInvert );

	// なみなみ
	color *= 0.78 - sin( vUv.y * 200.0 - time * 10.0 ) * 0.02;

	// 周辺減光的な
	color *= smoothstep( 1.0, 0.3, length( vUv - 0.5 ) );

	gl_FragColor = vec4( color, uSectionVisibility );

}