precision mediump float;

uniform sampler2D u_mirrorTexture; // Reflection texture
uniform float u_time; // Time for animation
uniform float u_alpha; // Transparency
uniform vec3 u_lightPos; // Light position

in vec2 vUv; // Varying for texture coordinates

out vec4 fragColor; // Explicit output variable

// Wave distortion function to animate the water surface
float wave(vec2 p) {
    return sin(p.x * 10.0f + u_time) * 0.02f + sin(p.y * 10.0f + u_time * 0.8f) * 0.02f;
}

// Approximate normal for the water surface (to simulate bump mapping)
vec3 computeNormal(vec2 uv) {
    float dx = wave(uv + vec2(0.01f, 0.0f)) - wave(uv - vec2(0.01f, 0.0f));
    float dy = wave(uv + vec2(0.0f, 0.01f)) - wave(uv - vec2(0.0f, 0.01f));
    return normalize(vec3(-dx, -dy, 1.0f)); // Normal vector from wave distortion
}

void main() {
    // Distort the UVs for wave animation (move the water)
    vec2 uv = vUv;
    uv.x += wave(uv); // Distort in X axis for ripple effect
    uv.y += wave(uv + vec2(0.1f, 0.1f)); // Distort in Y axis for additional wave movement

    // Compute normal vector for lighting calculations
    vec3 normal = computeNormal(uv);

    // Calculate diffuse lighting (basic Phong lighting)
    vec3 lightDir = normalize(u_lightPos - vec3(uv, 0.0f));
    float diff = max(dot(normal, lightDir), 0.0f); // Diffuse term

    // Calculate specular reflection (Phong model)
    vec3 viewDir = normalize(-vec3(uv, 0.0f)); // View direction (camera direction)
    vec3 reflectDir = reflect(-lightDir, normal); // Reflection direction
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), 16.0f); // Specular term

    // Sample the reflection texture (distorted by UVs)
    vec4 reflection = texture(u_mirrorTexture, uv);

    // Apply lighting to the reflection
    vec3 finalColor = reflection.rgb * (0.5f + diff * 0.5f); // Diffuse lighting
    finalColor += spec * 0.8f; // Specular highlight (shine)

    // Output final color with transparency
    fragColor = vec4(finalColor, u_alpha); // Set the 
}