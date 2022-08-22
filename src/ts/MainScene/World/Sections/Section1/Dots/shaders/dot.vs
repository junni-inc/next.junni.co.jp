varying vec2 vUv;
varying vec3 vPos;
uniform float uVisibility;
uniform float num;

#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

float easeOutBack(float x) {

	float c1 = 1.70158;
	float c3 = c1 + 1.0;

	return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
	
}

void main( void ) {

	vec3 pos = position;

	float v = easeOutBack( linearstep( 0.0, 1.0, -num + uVisibility * 1.5) );
	pos *= v;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}