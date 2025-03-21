import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import room from "./objects/room";
import scene_objects from "./objects/scene_objects";
import vertexShader from "/shaders/teste/vertexShader.glsl";
import fragmentShader from "/shaders/teste/fragmentShader.glsl";
import * as dat from "dat.gui";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 20, 90);
camera.rotation.set(-Math.PI / 4, 0, 0); // Adjust rotation as needed
camera.lookAt(0, 30, 0); // Look at the center of the scene

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 100;
controls.minDistance = 10;
controls.update();

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
reflectionCamera.position.set(0, 5, 15); // Position below the water plane
reflectionCamera.lookAt(0, 0, 0);

// Define a clipping plane at the water plane's height
// const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 60); // Normal points downward, height = 30


const waterMaterial = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    u_time: { value: 0.4 },
    uDudvMap: { value: dudvMap },
    u_alpha: { value: 1.0 },
    uReflectionTexture: { value: reflectionRenderTarget.texture },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uDistortionStrength: { value: 0.1 },
  },
  transparent: true,
  clipping: false, // Disable clipping for the water plane
});

// Water plane
const waterGeometry = new THREE.PlaneGeometry(50, 50, 512, 512);
const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
waterPlane.position.set(0, 30, 0); // Adjust position as needed
waterPlane.renderOrder = 1; // Render the water plane last
scene.add(waterPlane);

// GUI for alpha control
const gui = new dat.GUI();
const params = { u_alpha: 1.0 };
gui.add(params, "u_alpha", 0, 1).onChange((value) => {
  waterMaterial.uniforms.u_alpha.value = value;
});

// Add room and objects
scene.add(room.planeBottom);
scene.add(room.planeTop);
scene.add(room.planeFront);
scene.add(room.planeBack);
scene.add(room.planeRight);
scene.add(room.planeLeft);

// Add a sphere for reflection/refraction
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 30, 30);
scene.add(sphere);

// Add a cube for reflection/refraction
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 30, -30);
scene.add(cube);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

function mirrorCamera(mainCamera, reflectionCamera, waterHeight) {
  // Mirror the position
  // reflectionCamera.position.copy(mainCamera.position);
  // reflectionCamera.position.y = 2 * waterHeight - mainCamera.position.y; // Mirror across the water plane

  // Clamp in the room
  reflectionCamera.x = Math.max(
    room.ROOM_BOUNDS.minX,
    Math.min(room.ROOM_BOUNDS.maxX, reflectionCamera.x)
  );
  reflectionCamera.y = Math.max(
    room.ROOM_BOUNDS.minY,
    Math.min(room.ROOM_BOUNDS.maxY, reflectionCamera.y)
  );
  reflectionCamera.z = Math.max(
    room.ROOM_BOUNDS.minZ,
    Math.min(room.ROOM_BOUNDS.maxZ, reflectionCamera.z)
  );

  reflectionCamera.position.copy(waterPlane.position);
  reflectionCamera.lookAt(mainCamera);

  // Mirror the rotation
  reflectionCamera.rotation.copy(mainCamera.rotation);
  reflectionCamera.rotation.x = reflectionCamera.rotation.x; // Mirror the X rotation

  reflectionCamera.updateProjectionMatrix();
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime();

  // Mirror the reflection camera
  mirrorCamera(camera, reflectionCamera, waterPlane.position.y);

  // Update shader uniforms
  waterMaterial.uniforms.u_time.value = time;

  // Render the reflection texture with clipping
  waterPlane.visible = false; // Hide the water plane while rendering the reflection
  renderer.setRenderTarget(reflectionRenderTarget);
  // renderer.clippingPlanes = [clippingPlane]; // Enable clipping for the reflection camera
  renderer.render(scene, reflectionCamera);
  renderer.setRenderTarget(null);
  renderer.clippingPlanes = []; // Disable clipping for the main camera
  waterPlane.visible = true; // Show the water plane again

  // Update controls
  controls.update();

  // Render the scene with the main camera (no clipping)
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
