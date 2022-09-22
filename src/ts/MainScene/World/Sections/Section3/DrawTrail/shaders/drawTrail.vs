attribute vec2 computeUV;

uniform sampler2D uPosDataTex;
uniform vec2 uDataSize;

varying vec2 vUv;

mat3 makeRotationDir( vec3 direction, vec3 up ) {

	vec3 xaxis = normalize( cross( up, direction ) );
	vec3 yaxis = normalize( cross( direction, xaxis ) );

	return mat3(
		xaxis.x, yaxis.x, direction.x,
		xaxis.y, yaxis.y, direction.y,
		xaxis.z, yaxis.z, direction.z
	);

}

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;
    vec2 nextUV = computeUV + vec2(1.0 / ( uDataSize.x - 1.0 ) * 2.0, 0.0);

	vec4 posData = texture2D( uPosDataTex, computeUV );
    vec4 nextPosData = texture2D( uPosDataTex, nextUV );

	// posData.xyz = floor( posData.xyz * 3.0 ) / 3.0;
	// // nextPosData.xyz = floor( nextPosData.xyz * 3.0 ) / 3.0;

	
    vec3 delta = ( posData.xyz - nextPosData.xyz ) * 2.0;
	vec3 vec = normalize( delta );

	pos *= makeRotationDir(vec, vec3( 0.0, 1.0, 0.0 ) );
	pos.xy *= rotate( PI / 2.0 );
	pos *= length( delta );
	pos += posData.xyz;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}