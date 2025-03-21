uniform float u_time;
varying vec2 vUv;

void main() {
    vUv = uv;

        // Create a simple wave effect
    float wave = sin(position.x * 2.0 + u_time) * 0.1;
    vec3 newPosition = position + vec3(0.0, wave, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}