
varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixcoord;

uniform vec4 SMAA_RT_METRICS;

void SMAABlendingWeightCalculationVS(vec2 texcoord) {
    vPixcoord = texcoord * SMAA_RT_METRICS.zw;

    // We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
    vOffset[0] = mad(SMAA_RT_METRICS.xyxy, vec4(-0.25, -0.125, 1.25, -0.125), texcoord.xyxy);
    vOffset[1] = mad(SMAA_RT_METRICS.xyxy, vec4(-0.125, -0.25, -0.125, 1.25), texcoord.xyxy);

    // And these for the searches, they indicate the ends of the loops:
    vOffset[2] = mad(SMAA_RT_METRICS.xxyy, vec4(-2.0, 2.0, -2.0, 2.0) * float(SMAA_MAX_SEARCH_STEPS), vec4(vOffset[0].xz, vOffset[1].yw));
}

void main(void) {

    vec3 pos = position;

    gl_Position = vec4(position, 1.0);

    SMAABlendingWeightCalculationVS(uv);

    vUv = uv;
}