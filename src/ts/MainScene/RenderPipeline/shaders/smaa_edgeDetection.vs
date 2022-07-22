
varying vec2 vUv;
varying vec4 vOffset[3];
uniform vec4 SMAA_RT_METRICS;

void SMAAEdgeDetectionVS(vec2 texcoord) {
    vOffset[0] = mad(SMAA_RT_METRICS.xyxy, vec4(-1.0, 0.0, 0.0, -1.0), texcoord.xyxy);
    vOffset[1] = mad(SMAA_RT_METRICS.xyxy, vec4(1.0, 0.0, 0.0, 1.0), texcoord.xyxy);
    vOffset[2] = mad(SMAA_RT_METRICS.xyxy, vec4(-2.0, 0.0, 0.0, -2.0), texcoord.xyxy);
}

void main(void) {

    vec3 pos = position;

    gl_Position = vec4(position, 1.0);

    SMAAEdgeDetectionVS(uv);

    vUv = uv;
}