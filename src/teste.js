import * as THREE from "three";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { color } from "three/tsl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position the camera
camera.position.set(0, 60, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Mirror Reflection

const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
);

const mirrorCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Scencario

const geometryPlaneRoom = new THREE.PlaneGeometry(100.1, 100.1);

const planeTop = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "red",
  })
);

planeTop.position.set(0, 100, 0);
planeTop.rotateX(Math.PI / 2);
scene.add(planeTop);

const planeBotton = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "red",
  })
);

planeBotton.rotateX(-Math.PI / 2);
scene.add(planeBotton);

const planeLeft = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "blue",
  })
);
planeLeft.rotateY(Math.PI / 2);

planeLeft.position.set(-50, 50, 0);
scene.add(planeLeft);

const planeRight = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "blue",
  })
);

planeRight.rotateY(-Math.PI / 2);
planeRight.position.set(50, 50, 0);
scene.add(planeRight);

const planeBack = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "yellow",
  })
);

planeBack.position.set(0, 50, -50);

scene.add(planeBack);

const planeFront = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({
    color: "yellow",
  })
);

planeFront.position.set(0, 50, 50);
planeFront.rotateY(-Math.PI);
scene.add(planeFront);

// Plane Refraction
const planeRefraction = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      u_mirrorTexture: { value: renderTarget.texture },
      u_alpha: { value: 0.5 },
    },
    transparent: true,
  })
);

planeRefraction.rotateY(-Math.PI / 2);
planeRefraction.position.set(0, 50, 0);
scene.add(planeRefraction);

// =========================================
// Objects

// First Object
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10, 10);
const cube = new THREE.Mesh(
  cubeGeometry,
  new THREE.MeshBasicMaterial({
    color: "black",
  })
);
cube.position.set(-30, 45, -20);

scene.add(cube);

// Second Object
const sphereGeometry = new THREE.SphereGeometry(10, 10, 10, 10);
const sphere = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({
    color: "black",
  })
);
sphere.position.set(-30, 45, 20);

scene.add(sphere);

function animate() {
  controls.update();

  // Mirror Camera
  mirrorCamera.position.copy(camera.position);
  mirrorCamera.lookAt(planeRefraction.position);

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, mirrorCamera);
  renderer.setRenderTarget(null);

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
