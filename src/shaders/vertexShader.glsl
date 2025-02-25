
precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute float a_modulus;

uniform float u_amplitude;
uniform float u_time;

varying vec3 v_position;
varying vec2 v_uv;

varying float v_a_modulus;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += sin(modelPosition.x * u_amplitude + u_time) *0.15;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;


    gl_Position = projectionPosition;

    v_position = position;
    v_uv = uv;
    v_a_modulus = a_modulus;


}
