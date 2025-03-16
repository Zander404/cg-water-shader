import * as THREE from "three";
import * as dat from "dat.gui";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import room from "./objects/room";
import scene_objects from "./objects/scene_objects";

// Scene, Camera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Camera Position
camera.position.set(0, 80, 200);

// Reflection Render Target
const renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
});

const mirrorCamera = new THREE.PerspectiveCamera(
  75,
  innerWidth + innerHeight / innerHeight - innerWidth,
  1,
  500
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 600;
controls.minDistance = 10;
controls.update();

// ==================== Lights Walls ==========================
// Add a light source
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(50, 100, 50); // Position above the scene
scene.add(light);

// Optional: Add ambient light for a softer look
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// ===========================================================

scene.add(room.planeBottom);
scene.add(room.planeTop);

scene.add(room.planeFront);
scene.add(room.planeBack);

scene.add(room.planeRight);
scene.add(room.planeLeft);

// ================= Mirror Plane ====================================
const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
const planeRefraction = new THREE.Mesh(
  mirrorGeometry,
  new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,

    uniforms: {
      u_mirrorTexture: { value: renderTarget.texture },
      u_time: { value: 5.0 },
      u_alpha: { value: 0.5 }, // Adjust transparency
    },
    transparent: true,
  })
);

planeRefraction.position.set(0, 50, 0);
scene.add(planeRefraction);

const gui = new dat.GUI();
const params = { u_alpha: 0.5 }; // Initial opacity

gui.add(params, "u_alpha", 0, 1).onChange((value) => {
  planeRefraction.uniforms.u_alpha = value;
});

// ======================= Objects in the Scene =======================

// Cube
scene_objects.cube.position.set(30, 45, 20);
scene.add(scene_objects.cube);

//Shere
scene_objects.sphere.position.set(-30, 45, 20);
scene.add(scene_objects.sphere);

// ====== Camera Reflection Function ======
function updateMirrorCamera(mainCamera, mirror, mirrorCamera) {
  let normal = new THREE.Vector3(0, 0, 1); // Normal of the Plane
  normal.applyQuaternion(planeRefraction.quaternion); // Adjust the rotation of the plane
  let d = normal.dot(planeRefraction.position);

  // Reflection of the Camera Position
  let mirroredPosition = camera.position.clone();
  mirroredPosition.sub(
    normal.clone().multiplyScalar(2 * (camera.position.dot(normal) - d))
  );

  // 🔥 Clamp position to stay inside the room
  mirroredPosition.x = Math.max(
    room.ROOM_BOUNDS.minX,
    Math.min(room.ROOM_BOUNDS.maxX, mirroredPosition.x)
  );
  mirroredPosition.y = Math.max(
    room.ROOM_BOUNDS.minY,
    Math.min(room.ROOM_BOUNDS.maxY, mirroredPosition.y)
  );
  mirroredPosition.z = Math.max(
    room.ROOM_BOUNDS.minZ,
    Math.min(room.ROOM_BOUNDS.maxZ, mirroredPosition.z)
  );

  mirrorCamera.position.copy(mirroredPosition);
  mirrorCamera.lookAt(planeRefraction.position);
  mirrorCamera.updateProjectionMatrix();
  mirrorCamera.scale.set(-1, 1, 1);
}

const mirrorNormal = new THREE.Vector3(0, 1, 1); // Adjust if needed
mirrorNormal.applyQuaternion(planeRefraction.quaternion);

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Update the mirror camera
  updateMirrorCamera(camera, planeRefraction, mirrorCamera);

  // Render the reflection (update reflection texture)
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, mirrorCamera); // Render reflection with the mirror camera
  renderer.setRenderTarget(null);

  // Render the scene normally with the main camera
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
