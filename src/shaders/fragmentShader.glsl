precision mediump float;

varying vec3 v_position;
varying vec2 v_uv;
varying float v_a_modulus;

uniform sampler2D u_texture;
// u_texture.

void main(){
    vec4 textre_ = texture2D(u_texture, v_uv);
    gl_FragColor = textre_;
}