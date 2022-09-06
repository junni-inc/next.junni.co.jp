uniform sampler2D tex;
uniform float loaded;
uniform float uIsVisibility;
uniform float uIntroLogoVisibility;

varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec4 col = vec4( 1.0, 1.0, 1.0, 1.0 );

	col.w = vAlpha * uIntroLogoVisibility;

	gl_FragColor = col;

}