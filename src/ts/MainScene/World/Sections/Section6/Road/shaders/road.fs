varying vec2 vUv;
varying vec3 vColor;

uniform float time;
uniform float uVisibility;

void main( void ) {

	vec3 color = vColor;

	gl_FragColor = vec4( color, uVisibility );

}