uniform sampler2D tex;
uniform float loaded;
uniform float uIntroLogoVisibility;
varying vec2 vUv;

void main( void ) {

	vec4 col = vec4( 1.0, 1.0, 1.0, 1.0 );

	col.w = loaded * uIntroLogoVisibility;

	gl_FragColor = col;

}