import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

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

// Plane
const geometryPlane = new THREE.PlaneGeometry(1, 1, -2);
const materialPlane = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometryPlane, materialPlane);
scene.add(plane);

plane.position.x = 0;

plane.position.z = 2;

//Cube
const geometryCube = new THREE.BoxGeometry(1, 1, 1);
const materialCube = new THREE.MeshBasicMaterial({
  color: "#FF0000",
});
const cube = new THREE.Mesh(geometryCube, materialCube);
scene.add(cube);

// RENDER
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  rendered.render(scene, camera);
}

animate();
