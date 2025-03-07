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
    fragmentShader: fragmentShader,
    // side: THREE.DoubleSide,
    uniforms: {
      u_mirrorTexture: { value: renderTarget.texture },
      u_alpha: { value: 0.5 }, // Adjust transparency
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
  let normal = new THREE.Vector3();
  mirror.getWorldDirection(normal);
  normal.negate(); // Flip for correct reflection

  let d = normal.dot(mirror.position);

  // Compute mirrored position
  let mirroredPosition = mainCamera.position.clone();
  mirroredPosition.sub(
    normal.clone().multiplyScalar(2 * (mainCamera.position.dot(normal) - d))
  );

  // 🔥 Clamp inside the room
  mirroredPosition.x = THREE.MathUtils.clamp(
    mirroredPosition.x,
    ROOM_BOUNDS.minX,
    ROOM_BOUNDS.maxX
  );
  mirroredPosition.y = THREE.MathUtils.clamp(
    mirroredPosition.y,
    ROOM_BOUNDS.minY,
    ROOM_BOUNDS.maxY
  );
  mirroredPosition.z = THREE.MathUtils.clamp(
    mirroredPosition.z,
    ROOM_BOUNDS.minZ,
    ROOM_BOUNDS.maxZ
  );

  mirrorCamera.position.copy(mirroredPosition);
  mirrorCamera.lookAt(mirror.position);

  // 🔥 Fix scene inversion by flipping the X scale
  mirrorCamera.scale.set(-1, 1, 1);

  mirrorCamera.updateProjectionMatrix();
}


const mirrorNormal = new THREE.Vector3(0, 0, 1); // Adjust if needed
mirrorNormal.applyQuaternion(planeRefraction.quaternion);

function animate() {
  updateMirrorCamera(camera, planeRefraction, mirrorCamera);

  // Render reflection
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, mirrorCamera);
  renderer.setRenderTarget(null);

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
