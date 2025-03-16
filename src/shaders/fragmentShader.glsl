precision mediump float;

uniform sampler2D u_mirrorTexture; // Reflection texture
uniform sampler2D u_waterTexture;

uniform float u_time; // Time for animation
uniform float u_alpha; // Transparency

uniform vec3 u_lightPos;

in vec2 vUv;

out vec4 fragColor;

// Wave distortion function to animate the water surface
float wave(vec2 p) {
    return sin(p.x * 10.0 + u_time) * 0.02 + sin(p.y * 10.0 + u_time * 0.8) * 0.02;
}

// Approximate normal for the water surface (to simulate bump mapping)
vec3 computeNormal(vec2 uv) {
    float dx = wave(uv + vec2(0.01, 0.0)) - wave(uv - vec2(0.01, 0.0));
    float dy = wave(uv + vec2(0.0, 0.01)) - wave(uv - vec2(0.0, 0.01));
    return normalize(vec3(-dx, -dy, 1.0)); // Normal vector from wave distortion
}

void main() {

    vec2 uv = vUv;

    uv.x += wave(uv); // Distort in X axis for ripple effect
    uv.y += wave(uv + vec2(0.1, 0.1)); // Distort in Y axis for additional wave movement

    // Texture
    vec4 waterColor = texture(u_waterTexture, uv);

    // Light
    vec3 normal = computeNormal(uv);
    vec3 lightDir = normalize(u_lightPos - vec3(uv, 0.0));
    float diff = max(dot(normal, lightDir), 0.0); // Diffuse term

    // Reflection 
    vec3 viewDir = normalize(-vec3(uv, 0.0)); // View direction (camera direction)
    vec3 reflectDir = reflect(-lightDir, normal); // Reflection direction
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // Specular term

    vec2 flippedUv = vec2(1.0 - vUv.x, vUv.y); // Flip the UV horizontally
    vec4 reflection = texture(u_mirrorTexture, flippedUv);

    // Apply lighting to the reflection
    vec3 finalColor = waterColor.rgb * reflection.rgb * (0.5 + diff * 0.5); // Diffuse lighting
    finalColor += spec * 0.8; // Specular highlight (shine)

    // Clamp the final color to ensure it is within the valid range [0, 1]
    finalColor = clamp(finalColor, 0.0, 1.0);



    // Output final color with transparency
    fragColor = vec4(finalColor, u_alpha); // Set the output color
}