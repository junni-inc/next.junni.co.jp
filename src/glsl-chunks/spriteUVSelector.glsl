
vec2 spriteUVSelector( vec2 uv, vec2 tile, float frames, float time ) {

	float t = floor(frames * mod( time, 1.0 ) );

	uv.x += mod(t, tile.x);
	uv.y -= floor(t / tile.x);

	uv.y -= 1.0;
	uv /= tile;
	uv.y += 1.0;
	
	return uv;
	
}

#pragma glslify: export(spriteUVSelector)