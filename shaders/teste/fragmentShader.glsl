precision highp float;
uniform sampler2D uReflectionTexture;
uniform float uDistortionStrength;
uniform float u_alpha;
uniform float u_time;
uniform sampler2D uDudvMap;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 uv = vUv;
  vec2 distortion = texture(uDudvMap, uv + u_time * 0.1).rg * 2.0 - 1.0;
  vec2 distortedUv = uv + distortion * uDistortionStrength;
  vec3 reflectionColor = texture(uReflectionTexture, distortedUv).rgb;
  fragColor = vec4(reflectionColor, u_alpha);
}