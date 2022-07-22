varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform bool direction;
uniform float gaussVar;
uniform float blurRange;
uniform float renderCount;
uniform float count;

#pragma glslify: blur13 = require( './gaussBlur13.glsl' )

void main(){

	vec4 c = blur13(backbuffer,vUv,resolution, (direction ? vec2(1.0,0.0) : vec2(0.0, 1.0) ) * blurRange * pow(( count / renderCount ) * 2.0, 2.0) );

	gl_FragColor = c;
}