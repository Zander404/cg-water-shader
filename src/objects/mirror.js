import * as THREE from "three";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";

const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
const planeRefraction = new THREE.Mesh(
  mirrorGeometry,
  new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // side: THREE.DoubleSide,
    uniforms: {
      u_time: { value: 5.0 },
      u_alpha: { value: 0.5 },
    },
    transparent: true,
  })
);

export default { planeRefraction };
