import * as THREE from "three";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";

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

// Limit of the ROOM
const ROOM_BOUNDS = {
  minX: -50,
  maxX: 50,
  minY: 0,
  maxY: 100,
  minZ: -50,
  maxZ: 50,
};

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

// ==================== Scene Walls ==========================

const geometryPlaneRoom = new THREE.PlaneGeometry(100, 100);

// Ceiling (Blue)
const planeTop = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "blue" })
);
planeTop.position.set(0, 100, 0);
planeTop.rotateX(Math.PI / 2);
scene.add(planeTop);

// Floor (Red)
const planeBottom = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "red" })
);
planeBottom.rotateX(-Math.PI / 2);
scene.add(planeBottom);

// Left Wall (Green)
const planeLeft = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "green" })
);
planeLeft.rotateY(Math.PI / 2);
planeLeft.position.set(-50, 50, 0);
scene.add(planeLeft);

// Right Wall (Blue)
const planeRight = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "blue" })
);
planeRight.rotateY(-Math.PI / 2);
planeRight.position.set(50, 50, 0);
scene.add(planeRight);

// Back Wall (Orange)
const planeBack = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "orange" })
);
planeBack.position.set(0, 50, -50);
scene.add(planeBack);

// Front Wall (Yellow)
const planeFront = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "yellow" })
);
planeFront.position.set(0, 50, 50);
planeFront.rotateY(-Math.PI);
scene.add(planeFront);
// ===================================================================

// ================= Mirror Plane ====================================
const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
const planeRefraction = new THREE.Mesh(
  mirrorGeometry,
  new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    glslVersion: THREE.GLSL3,
    fragmentShader: fragmentShader,
    // side: THREE.DoubleSide,
    uniforms: {
      u_mirrorTexture: { value: renderTarget.texture },
      u_time: { value: 5.0 },
      u_alpha: { value: 0.5 }, // Adjust transparency
      u_lightPos: { value: light.position },
    },
    transparent: true,
  })
);

planeRefraction.position.set(0, 50, 0);
scene.add(planeRefraction);

// ======================= Objects in the Scene =======================

// Cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "white" })
);
cube.position.set(30, 45, 20);
scene.add(cube);

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "white" })
);
sphere.position.set(-30, 45, 20);
scene.add(sphere);

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
    ROOM_BOUNDS.minX,
    Math.min(ROOM_BOUNDS.maxX, mirroredPosition.x)
  );
  mirroredPosition.y = Math.max(
    ROOM_BOUNDS.minY,
    Math.min(ROOM_BOUNDS.maxY, mirroredPosition.y)
  );
  mirroredPosition.z = Math.max(
    ROOM_BOUNDS.minZ,
    Math.min(ROOM_BOUNDS.maxZ, mirroredPosition.z)
  );

  mirrorCamera.position.copy(mirroredPosition);
  mirrorCamera.lookAt(planeRefraction.position);
  mirrorCamera.updateProjectionMatrix();
  mirrorCamera.scale.set(-1, 1, 1);
}

const mirrorNormal = new THREE.Vector3(0, 0, 1); // Adjust if needed
mirrorNormal.applyQuaternion(planeRefraction.quaternion);

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();
  // planeRefraction.uniforms.u_time.value = elapsedTime;
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
