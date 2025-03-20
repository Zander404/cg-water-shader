precision highp float;

uniform sampler2D uReflectionTexture; // Texture from the RenderTarget
uniform float uDistortionStrength; // Strength of distortion
uniform float u_alpha; // Transparency
uniform float u_time; // Time for animation
uniform sampler2D uDudvMap;

in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 uv = vUv;

  // Calculate distortion
  vec2 distortion = texture(uDudvMap, uv + u_time * 0.1f).rg * 2.0f - 1.0f;
  vec2 distortedUv = uv + distortion * uDistortionStrength;

  //Apply texture colors with distortion 
  vec3 reflectionColor = texture(uReflectionTexture, distortedUv).rgb;

  // Output the final Texture
  fragColor = vec4(reflectionColor, u_alpha);
}