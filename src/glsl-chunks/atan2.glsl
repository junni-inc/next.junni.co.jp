// https://qiita.com/7CIT/items/ad76cfa6771641951d31

float atan2(in float y, in float x) {
  return x == 0.0 ? sign(y) * 3.1415926535 / 2.0 : atan(y, x);
}

#pragma glslify: export(atan2)