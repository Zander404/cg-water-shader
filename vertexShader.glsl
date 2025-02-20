varying vec2 vUv;
varying float vWave;

uniform float uTime;

void main() {
    vUv = uv;

    // Ondulações na posição do vértice (simples seno baseado no tempo)
    vec3 pos = position;
    pos.y += sin(pos.x * 4.0 + uTime) * 0.1;
    pos.y += sin(pos.z * 4.0 + uTime) * 0.1;

    vWave = pos.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
