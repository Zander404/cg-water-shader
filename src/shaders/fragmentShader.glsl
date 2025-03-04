varying vec2 vUv;
uniform sampler2D u_mirrorTexture; // The reflected scene texture
uniform float u_alpha;  // Transparency factor

void main() {
    vec4 reflectedColor = texture2D(u_mirrorTexture, vUv);
    vec4 baseColor = vec4(1.0, 1.0, 1.0, u_alpha);  // White with transparency
    gl_FragColor = mix(baseColor, reflectedColor, 0.7); // Blend 70% reflection
}