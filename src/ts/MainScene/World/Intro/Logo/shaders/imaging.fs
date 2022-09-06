uniform sampler2D uTex;
uniform sampler2D uNoiseTex;
uniform float uImaging;
uniform float loaded;
uniform float uIntroLogoVisibility;

varying vec2 vUv;

void main( void ) {

	vec4 col = vec4( 1.0, 1.0, 1.0, 1.0 );

	vec4 noise = texture2D( uNoiseTex, vUv );

	vec2 uv = vUv;
	uv.x += noise.x * ( 1.0 - uImaging ) * 0.2;

	vec4 tex = texture2D( uTex, uv );
	col.w *= tex.w * uImaging;

	col.w *= uIntroLogoVisibility;

	gl_FragColor = col;

}