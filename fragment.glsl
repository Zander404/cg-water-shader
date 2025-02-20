varying vec2 vUv;
varying float vWave;

uniform float uTime;
uniform sampler2D uReflectionTexture;

void main() {
    // Simulando distorção na reflexão
    vec2 distortedUv = vUv;
    distortedUv.x += sin(vUv.y * 10.0 + uTime) * 0.02;
    distortedUv.y += cos(vUv.x * 10.0 + uTime) * 0.02;

    vec4 reflection = texture2D(uReflectionTexture, distortedUv);

    // Misturando a cor azul com a reflexão
    vec4 waterColor = mix(vec4(0.0, 0.3, 0.6, 1.0), reflection, 0.5);

    gl_FragColor = waterColor;
}
