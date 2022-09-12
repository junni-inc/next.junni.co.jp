varying vec2 vUv;
varying vec3 vColor;

uniform float time;

void main( void ) {

	vec3 pos = position;
	pos.z *= uv.x;
	pos.z += sin( uv.x * 5.0 - time ) * 1.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vColor = vec3( smoothstep( 0.0, 1.0, 1.0 - vUv.x ) );

}