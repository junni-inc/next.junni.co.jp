mat4 qua2mat( vec4 q ){

	mat4 m = mat4(
		1.0 - 2.0 * pow( q.y, 2.0 ) - 2.0 * pow( q.z, 2.0 ), 2.0 * q.x * q.y + 2.0 * q.w * q.z, 2.0 * q.x * q.z - 2.0 * q.w * q.y, 0.0,
		2.0 * q.x * q.y - 2.0 * q.w * q.z, 1.0 - 2.0 * pow( q.x, 2.0 ) - 2.0 * pow( q.z, 2.0 ), 2.0 * q.y * q.z + 2.0 * q.w * q.x, 0.0,
		2.0 * q.x * q.z + 2.0 * q.w * q.y, 2.0 * q.y * q.z - 2.0 * q.w * q.x, 1.0 - 2.0 * pow( q.x, 2.0 ) - 2.0 * pow( q.y, 2.0 ), 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	return m;

}

#pragma glslify: export(qua2mat)
