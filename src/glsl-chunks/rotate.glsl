mat2 rotate(float rad) {
  return mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
}

#pragma glslify: export(rotate)