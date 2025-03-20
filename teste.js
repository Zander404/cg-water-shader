import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import room from "./objects/room";
import scene_objects from "./objects/scene_objects";
import vertexShader from "/shaders/teste/vertexShader.glsl";
import fragmentShader from "/shaders/teste/fragmentShader.glsl";
import * as dat from "dat.gui";
import { reflect } from "three/tsl";
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 20, 90);
// camera.rotation.set(-Math.PI / 4, 0, 0); // Adjust rotation as needed
camera.lookAt(0, 20, 0); // Look at the center of the scene

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
// OrbitControls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load texture for distortion (DUDV map)
const textureLoader = new THREE.TextureLoader();
const dudvMap = textureLoader.load("/static/texture/1.jpg");
dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

// Create a reflection render target
const reflectionRenderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  }
);

// Create a reflection camera
const reflectionCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

reflectionCamera.position.copy(camera.position);

// Custom shader material for water
const waterMaterial = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    u_time: { value: 0.0 },
    uDudvMap: { value: dudvMap },
    u_alpha: { value: 0.8 },
    uReflectionTexture: { value: reflectionRenderTarget.texture },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uDistortionStrength: {
      value: 0.1,
    },
  },
  transparent: true,
});

// Water plane
const waterGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
// waterPlane.rotation.y = Math.PI;
waterPlane.position.set(1, 30, 2);
scene.add(waterPlane);

const gui = new dat.GUI();
const params = { u_alpha: 1.0 };

gui.add(params, "u_alpha", 0, 1).onChange((value) => {
  waterMaterial.uniforms.u_alpha.value = value;
});

// ======================ROOM=====================================

scene.add(room.planeBottom);
scene.add(room.planeTop);

scene.add(room.planeFront);
scene.add(room.planeBack);

scene.add(room.planeRight);
scene.add(room.planeLeft);

// ================= Object in Scene ====================================


const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 30, 30);
scene.add(sphere);


// Add a sphere for reflection/refraction
// const cubeGeometry = new THREE.boxGe(2, 32, 32);
// const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphere.position.set(10, 30, 0);
// scene.add(sphere);

// ================= Lights ====================================
// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

function mirrorCamera(mainCamera, reflectionCamera, waterHeight) {
  // Mirror the position
  reflectionCamera.position.copy(mainCamera.position);
  reflectionCamera.position.y = 2 * waterHeight - mainCamera.position.y; // Mirror across the water plane

  reflectionCamera.lookAt(waterPlane);
  // Mirror the rotation
  reflectionCamera.rotation.copy(mainCamera.rotation);
  reflectionCamera.rotation.x = -mainCamera.rotation.x; // Mirror the X rotation
  // reflectionCamera.rotation.y = -mainCamera.rotation.y; // Mirror the X rotation
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime();

  // Mirror the reflection camera
  mirrorCamera(camera, reflectionCamera, waterPlane.position.y);

  // Update shader uniforms
  waterMaterial.uniforms.u_time.value = time;

  // Render the reflection texture
  waterPlane.visible = false; // Hide the water plane while rendering the reflection
  renderer.setRenderTarget(reflectionRenderTarget);
  renderer.render(scene, reflectionCamera);
  renderer.setRenderTarget(null);
  waterPlane.visible = true; // Show the water plane again

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  waterMaterial.uniforms.uResolution.value.set(
    window.innerWidth,
    window.innerHeight
  );

  // Update reflection render target size
  reflectionRenderTarget.setSize(window.innerWidth, window.innerHeight);
});
