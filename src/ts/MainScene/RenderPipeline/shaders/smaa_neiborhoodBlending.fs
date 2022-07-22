
varying vec2 vUv;
varying vec4 vOffset;

uniform sampler2D backbuffer;
uniform sampler2D sceneTex;

uniform vec2 resolution;
uniform vec4 SMAA_RT_METRICS;

void SMAAMovc(vec2 cond, inout vec2 variable, vec2 value) {
    if (cond.x > 0.0)
        variable.x = value.x;
    if (cond.y > 0.0)
        variable.y = value.y;
}

void SMAAMovc(vec4 cond, inout vec4 variable, vec4 value) {
    SMAAMovc(cond.xy, variable.xy, value.xy);
    SMAAMovc(cond.zw, variable.zw, value.zw);
}

vec4 SMAANeighborhoodBlendingPS(vec2 texcoord, vec4 offset, sampler2D colorTex, sampler2D blendTex) {
    // Fetch the blending weights for current pixel:
    vec4 a;
    a.x  = texture2D(blendTex, offset.xy).a; // Right
    a.y  = texture2D(blendTex, offset.zw).g; // Top
    a.wz = texture2D(blendTex, texcoord).xz; // Bottom / Left

    // Is there any blending weight with a value greater than 0.0?
    if (dot(a, vec4(1.0, 1.0, 1.0, 1.0)) < 1e-5) {

        vec4 color = texture2D(colorTex, texcoord);
        return color;

    } else {

        float h = max(a.x, a.z) > max(a.y, a.w) ? 1.0 : 0.0; // max(horizontal) > max(vertical)

        // Calculate the blending offsets:
        vec4 blendingOffset = vec4(0.0, a.y, 0.0, a.w);
        vec2 blendingWeight = a.yw;
        SMAAMovc(vec4(h, h, h, h), blendingOffset, vec4(a.x, 0.0, a.z, 0.0));
        SMAAMovc(vec2(h, h), blendingWeight, a.xz);
        blendingWeight /= dot(blendingWeight, vec2(1.0, 1.0));

        // Calculate the texture coordinates:
        vec4 blendingCoord = mad(blendingOffset, vec4(SMAA_RT_METRICS.xy, -SMAA_RT_METRICS.xy), texcoord.xyxy);

        // We exploit bilinear filtering to mix current pixel with the chosen
        // neighbor:
        vec4 color;
        color += blendingWeight.x * texture2D(colorTex, blendingCoord.xy);
        color += blendingWeight.y * texture2D(colorTex, blendingCoord.zw);

        return color;
    }
}

void main(void) {
    gl_FragColor = SMAANeighborhoodBlendingPS(vUv, vOffset, sceneTex, backbuffer);
}