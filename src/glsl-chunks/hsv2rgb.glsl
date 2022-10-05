//https://qiita.com/keim_at_si/items/c2d1afd6443f3040e900

vec3 hsv2rgb( vec3 hsv ){

	return ((clamp(abs(fract(hsv.x+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*hsv.y+1.)*hsv.z;

}

#pragma glslify: export(hsv2rgb)
