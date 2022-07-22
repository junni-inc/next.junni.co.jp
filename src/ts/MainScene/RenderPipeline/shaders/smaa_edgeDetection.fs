
varying vec2 vUv;
varying vec4 vOffset[3];

uniform sampler2D sceneTex;

vec2 SMAAColorEdgeDetectionPS(vec2 texcoord, vec4 offset[3], sampler2D colorTex) {
    // Calculate the threshold:
    vec2 threshold = vec2(SMAA_THRESHOLD, SMAA_THRESHOLD);

    // Calculate color deltas:
    vec4 delta;
    vec3 C = texture2D(colorTex, texcoord).rgb;

    vec3 Cleft = texture2D(colorTex, offset[0].xy).rgb;
    vec3 t     = abs(C - Cleft);
    delta.x    = max(max(t.r, t.g), t.b);

    vec3 Ctop = texture2D(colorTex, offset[0].zw).rgb;
    t         = abs(C - Ctop);
    delta.y   = max(max(t.r, t.g), t.b);

    // We do the usual threshold:
    vec2 edges = step(threshold, delta.xy);

    // Then discard if there is no edge:
    if (dot(edges, vec2(1.0, 1.0)) == 0.0)
        return vec2(0.0);

    // Calculate right and bottom deltas:
    vec3 Cright = texture2D(colorTex, offset[1].xy).rgb;
    t           = abs(C - Cright);
    delta.z     = max(max(t.r, t.g), t.b);

    vec3 Cbottom = texture2D(colorTex, offset[1].zw).rgb;
    t            = abs(C - Cbottom);
    delta.w      = max(max(t.r, t.g), t.b);

    // Calculate the maximum delta in the direct neighborhood:
    vec2 maxDelta = max(delta.xy, delta.zw);

    // Calculate left-left and top-top deltas:
    vec3 Cleftleft = texture2D(colorTex, offset[2].xy).rgb;
    t              = abs(C - Cleftleft);
    delta.z        = max(max(t.r, t.g), t.b);

    vec3 Ctoptop = texture2D(colorTex, offset[2].zw).rgb;
    t            = abs(C - Ctoptop);
    delta.w      = max(max(t.r, t.g), t.b);

    // Calculate the final maximum delta:
    maxDelta         = max(maxDelta.xy, delta.zw);
    float finalDelta = max(maxDelta.x, maxDelta.y);

    // Local contrast adaptation:
    edges.xy *= step(finalDelta, SMAA_LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

    return edges;
}

void main(void) {
    gl_FragColor = vec4(SMAAColorEdgeDetectionPS(vUv, vOffset, sceneTex), 0.0, 0.0);
}