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
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
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
  0.1,
  1000
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 600;
controls.minDistance = 10;
controls.update();

// ==================== Lights Walls ==========================
// Add a light source
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(50, 100, 50);
scene.add(light);

// Ambient light for a softer look
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

// ======================ROOM=====================================

scene.add(room.planeBottom);
scene.add(room.planeTop);

scene.add(room.planeFront);
scene.add(room.planeBack);

scene.add(room.planeRight);
scene.add(room.planeLeft);

// ================= Mirror Plane ====================================

const textureLoader = new THREE.TextureLoader();
const waterTexture = textureLoader.load("/static/texture/water_texture.jpg");

const mirrorGeometry = new THREE.PlaneGeometry(100, 100);

const mirrorMaterial = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,

  uniforms: {
    u_mirrorTexture: { value: renderTarget.texture },
    u_time: { value: 5.0 },
    u_alpha: { value: 1.0 }, // Adjust transparency
    u_waterTexture: { value: waterTexture },
  },
  transparent: true,
});
const planeRefraction = new THREE.Mesh(mirrorGeometry, mirrorMaterial);

planeRefraction.position.set(0, 50, 0);
scene.add(planeRefraction);

const gui = new dat.GUI();
const params = { u_alpha: 1.0 };

gui.add(params, "u_alpha", 0, 1).onChange((value) => {
  mirrorMaterial.uniforms.u_alpha.value = value;
});

// ======================= Objects in the Scene =======================

// Cube
scene_objects.cube.position.set(30, 45, -40);
scene.add(scene_objects.cube);

//Shere
scene_objects.sphere.position.set(0, 45, 20);

scene.add(scene_objects.sphere);

// ====== Camera Reflection Function ======
function updateMirrorCamera(mainCamera, mirrorCamera) {
  let normal = new THREE.Vector3(0, 0, 1);
  normal.applyQuaternion(planeRefraction.quaternion); // Adjust the rotation of the plane
  let d = normal.dot(planeRefraction.position);

  // Reflection of the Camera Position
  const mirroredPosition = mainCamera.position.clone();

  mirroredPosition.sub(
    normal.clone().multiplyScalar(2 * mainCamera.position.dot(normal) - d)
  );

  // Clamp in the room
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
  mirrorCamera.lookAt(
    planeRefraction.position.x,
    planeRefraction.position.y,
    planeRefraction.position.z
  );
  mirrorCamera.updateProjectionMatrix();
}

function animate() {
  // Update the mirror camera
  updateMirrorCamera(camera, mirrorCamera);

  // Reflection
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, mirrorCamera);
  renderer.setRenderTarget(null);

  // Render the scene normally with the main camera
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
