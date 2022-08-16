uniform float uSectionVisibility;
uniform float uSectionViewing;
attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

#pragma glslify: rotate = require('./rotate.glsl' )

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	vec3 pos = position;
	pos.xy *= rotate( uSectionViewing * 5.0 );
	pos *= uSectionVisibility;

	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normalMatrix * normal;
	vec3 normal = normalize( transformedNormal );

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normal;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;
	
}