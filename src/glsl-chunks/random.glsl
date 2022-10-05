// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl

float random(vec2 p){
	return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

#pragma glslify: export(random)
