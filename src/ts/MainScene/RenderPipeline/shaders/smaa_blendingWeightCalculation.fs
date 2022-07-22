
varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixcoord;

uniform vec4 SMAA_RT_METRICS;

uniform sampler2D backbuffer;
uniform sampler2D areaTex;
uniform sampler2D searchTex;

float round(float x) {
    return sign(x) * floor(abs(x) + 0.5);
}

vec2 round(vec2 value) {
    return vec2(round(value.x), round(value.y));
}

vec4 texture2DOffset(sampler2D tex, vec2 uv, vec2 offset) {
    return texture2D(tex, uv + offset * SMAA_RT_METRICS.xy);
}

float SMAASearchLength(sampler2D searchTex, vec2 e, float bias, float scale) {

    e.r = mad(scale, e.r, bias);
    return SMAA_SEARCHTEX_SELECT(texture2D(searchTex, e, 0.0));
}

float SMAASearchXLeft(sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end) {
    /**
     * @PSEUDO_GATHER4
     * This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
     * sample between edge, thus fetching four edges in a row.
     * Sampling with different offsets in each direction allows to disambiguate
     * which edges are active from the four fetched ones.
     */
    vec2 e = vec2(0.0, 1.0);

    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {

        e        = texture2D(edgesTex, texcoord, 0.0).rg;
        texcoord = mad(-vec2(2.0, 0.0), SMAA_RT_METRICS.xy, texcoord);

        if (!(texcoord.x > end && e.g > 0.8281 && e.r == 0.0))
            break;
    }

    float offset = mad(-255.0, SMAASearchLength(searchTex, e, 0.0, 0.5), 3.25);
    return mad(SMAA_RT_METRICS.x, offset, texcoord.x);
}

float SMAASearchXRight(sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end) {
    vec2 e = vec2(0.0, 1.0);

    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {

        e        = texture2D(edgesTex, texcoord, 0.0).rg;
        texcoord = mad(vec2(2.0, 0.0), SMAA_RT_METRICS.xy, texcoord);

        if (!(texcoord.x < end && e.g > 0.8281 && e.r == 0.0))
            break;
    }

    float offset = mad(-255.0, SMAASearchLength(searchTex, e, 0.5, 0.5), 3.25);
    return mad(-SMAA_RT_METRICS.x, offset, texcoord.x);
}

float SMAASearchYUp(sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end) {
    vec2 e = vec2(1.0, 0.0);

    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {

        e        = texture2D(edgesTex, texcoord, 0.0).rg;
        texcoord = mad(-vec2(0.0, 2.0), SMAA_RT_METRICS.xy, texcoord);

        if (!(texcoord.y > end && e.r > 0.8281 && e.g == 0.0))
            break;
    }

    float offset = mad(-255.0, SMAASearchLength(searchTex, e.gr, 0.0, 0.5), 3.25);
    return mad(SMAA_RT_METRICS.y, offset, texcoord.y);
}

float SMAASearchYDown(sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end) {
    vec2 e = vec2(1.0, 0.0);

    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {
        e        = texture2D(edgesTex, texcoord, 0.0).rg;
        texcoord = mad(vec2(0.0, 2.0), SMAA_RT_METRICS.xy, texcoord);

        if (!(texcoord.y < end && e.r > 0.8281 && e.g == 0.0))
            break;
    }

    float offset = mad(-255.0, SMAASearchLength(searchTex, e.gr, 0.5, 0.5), 3.25);
    return mad(-SMAA_RT_METRICS.y, offset, texcoord.y);
}

vec2 SMAAArea(sampler2D areaTex, vec2 dist, float e1, float e2, float offset) {
    // Rounding prevents precision errors of bilinear filtering:
    vec2 texcoord = mad(vec2(SMAA_AREATEX_MAX_DISTANCE, SMAA_AREATEX_MAX_DISTANCE), round(4.0 * vec2(e1, e2)), dist);

    // We do a scale and bias for mapping to texel space:
    texcoord = mad(SMAA_AREATEX_PIXEL_SIZE, texcoord, 0.5 * SMAA_AREATEX_PIXEL_SIZE);

    // Move to proper place, according to the subpixel offset:
    texcoord.y = mad(SMAA_AREATEX_SUBTEX_SIZE, offset, texcoord.y);

    // Do it!
    return SMAA_AREATEX_SELECT(texture2D(areaTex, texcoord));
}

vec4 SMAABlendingWeightCalculationPS(vec2 texcoord, vec2 pixcoord, vec4 offset[3], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices) { // Just pass zero for SMAA 1x, see @SUBSAMPLE_INDICES.
    vec4 weights = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 e       = texture2D(edgesTex, texcoord).rg;

    if (e.g > 0.0) { // Edge at north

        vec2 d;

        // Find the distance to the left:
        vec3 coords;
        coords.x = SMAASearchXLeft(edgesTex, searchTex, offset[0].xy, offset[2].x);
        coords.y = offset[1].y; // offset[1].y = texcoord.y - 0.25 * SMAA_RT_METRICS.y (@CROSSING_OFFSET)
        d.x      = coords.x;

        // Now fetch the left crossing edges, two at a time using bilinear
        // filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
        // discern what value each edge has:
        float e1 = texture2D(edgesTex, coords.xy, 0.0).r;

        // Find the distance to the right:
        coords.z = SMAASearchXRight(edgesTex, searchTex, offset[0].zw, offset[2].y);
        d.y      = coords.z;

        // We want the distances to be in pixel units (doing this here allow to
        // better interleave arithmetic and memory accesses):
        d = abs(round(mad(SMAA_RT_METRICS.zz, d, -pixcoord.xx)));

        // SMAAArea below needs a sqrt, as the areas texture is compressed
        // quadratically:
        vec2 sqrt_d = sqrt(d);

        // Fetch the right crossing edges:
        float e2 = texture2DOffset(edgesTex, coords.zy, vec2(1, 0)).r;

        // Ok, we know how this pattern looks like, now it is time for getting
        // the actual area:
        weights.rg = SMAAArea(areaTex, sqrt_d, e1, e2, float(subsampleIndices.y));

        // Fix corners:
        // coords.y = texcoord.y;
        // SMAADetectHorizontalCornerPattern(edgesTex, weights.rg, coords.xyzy, d);
    }

    if (e.r > 0.0) { // Edge at west
        vec2 d;

        // Find the distance to the top:
        vec3 coords;
        coords.y = SMAASearchYUp(edgesTex, searchTex, offset[1].xy, offset[2].z);
        coords.x = offset[0].x; // offset[1].x = texcoord.x - 0.25 * SMAA_RT_METRICS.x;
        d.x      = coords.y;

        // Fetch the top crossing edges:
        float e1 = texture2D(edgesTex, coords.xy).g;

        // Find the distance to the bottom:
        coords.z = SMAASearchYDown(edgesTex, searchTex, offset[1].zw, offset[2].w);
        d.y      = coords.z;

        // We want the distances to be in pixel units:
        d = abs(round(mad(SMAA_RT_METRICS.ww, d, -pixcoord.yy)));

        // SMAAArea below needs a sqrt, as the areas texture is compressed
        // quadratically:
        vec2 sqrt_d = sqrt(d);

        // Fetch the bottom crossing edges:
        float e2 = texture2DOffset(edgesTex, coords.xz, vec2(0, 1)).g;

        // Get the area for this direction:
        weights.ba = SMAAArea(areaTex, sqrt_d, e1, e2, float(subsampleIndices.x));
    }

    return weights;
}

void main(void) {
    gl_FragColor = SMAABlendingWeightCalculationPS(vUv, vPixcoord, vOffset, backbuffer, areaTex, searchTex, ivec4(0.0));
}