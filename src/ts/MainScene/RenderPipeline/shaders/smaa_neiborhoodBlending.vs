varying vec2 vUv;
varying vec4 vOffset;

uniform sampler2D backbuffer;
uniform vec2 resolution;
uniform vec4 SMAA_RT_METRICS;

void SMAANeighborhoodBlendingVS(vec2 texcoord) {
    vOffset = mad(SMAA_RT_METRICS.xyxy, vec4(1.0, 0.0, 0.0, 1.0), texcoord.xyxy);
}

void main(void) {

    vec3 pos = position;

    gl_Position = vec4(position, 1.0);

    SMAANeighborhoodBlendingVS(uv);

    vUv = uv;
}