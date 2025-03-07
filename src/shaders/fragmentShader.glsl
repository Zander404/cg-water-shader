varying vec2 vUv;
uniform sampler2D u_mirrorTexture; // The reflected scene texture
uniform float u_alpha;  // Transparency factor

uniform vec4 clippingPlane;

void main() {
    vec4 reflectedColor = texture2D(u_mirrorTexture, vUv);
    vec4 baseColor = vec4(1.0, 1.0, 1.0, u_alpha);  // White with transparency

    gl_FragColor = mix(baseColor, reflectedColor, 0.8); // Blend 70% reflection

    if(gl_FragCoord.y < 50.0)
        discard; // Discard pixels below a certain height

}