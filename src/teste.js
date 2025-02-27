import * as THREE from "three";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";

import { OrbitControls } from "three/examples/jsm/Addons.js";
import { color } from "three/tsl";

// WORLD
const rendered = new THREE.WebGLRenderer();
rendered.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(rendered.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const controls = new OrbitControls(camera, rendered.domElement);

controls.update();

// OBJECTS

// Texture

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("static/texture/water_texture.jpg");

//Plane
const geometryPlane = new THREE.PlaneGeometry(4, 4, 64, 64);
const materialPlane = new THREE.RawShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    u_amplitude: { value: 12 },
    u_time: { value: 0 },
    u_texture: { value: texture },
  },
});

const plane = new THREE.Mesh(geometryPlane, materialPlane);
scene.add(plane);
console.log(plane.geometry);

// Cube 1
const geometryBox = new THREE.BoxGeometry(1, 1, 1, 1);
const cube1Material = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
});

const cube = new THREE.Mesh(geometryBox, cube1Material);
cube.position.z = 1;

scene.add(cube);

// ADD Ondulation to Plane
const amount = geometryPlane.attributes.position.count;
const newAtributeArray = new Float32Array(amount);

for (let i = 0; i < amount; i++) {
  newAtributeArray[i] = i % 2;
}

geometryPlane.setAttribute(
  "a_modulus",
  new THREE.BufferAttribute(newAtributeArray, 1)
);

// Clock
const clock = new THREE.Clock();
// RENDER
function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Update Animation
  materialPlane.uniforms.u_time.value = elapsedTime;

  requestAnimationFrame(animate);
  controls.update();
  rendered.render(scene, camera);
  rendered.setClearColor(0xff0000, 0.15);
}

animate();
