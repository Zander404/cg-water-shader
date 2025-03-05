import * as THREE from "three";
import vertexShader from "/shaders/vertexShader.glsl";
import fragmentShader from "/shaders/fragmentShader.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// Scene, Camera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Camera Position
camera.position.set(0, 75, 160);

// Reflection Render Target
const renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
});

const mirrorCamera = new THREE.PerspectiveCamera(
  35,
  innerWidth + innerHeight / innerHeight - innerWidth,
  1,
  500
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(camera.position.addScalar(2));
controls.maxDistance = 400;
controls.minDistance = 10;
controls.update();

// ====== Scene Walls ======

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

// ====== Mirror Plane ======
const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
const planeRefraction = new THREE.Mesh(
  mirrorGeometry,
  new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      u_mirrorTexture: { value: renderTarget.texture },
      u_alpha: { value: 0.5 }, // Adjust transparency
    },
    transparent: true,
  })
);

planeRefraction.position.set(0, 50, 0);
scene.add(planeRefraction);

// ====== Objects in the Scene ======

// Cube (Black)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "black" })
);
cube.position.set(-30, 45, -20);
scene.add(cube);

// Sphere (Black)
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "black" })
);
sphere.position.set(-30, 45, 20);
scene.add(sphere);

// ====== Camera Reflection Function ======
function updateMirrorCamera(mainCamera, mirror, mirrorCamera) {
  // Espelha a câmera ao longo do eixo do plano
  let normal = new THREE.Vector3(0, 0, 1); // Normal do plano (ajuste conforme necessário)
  normal.applyQuaternion(planeRefraction.quaternion); // Ajusta para a rotação do plano
  let d = normal.dot(planeRefraction.position);

  // Reflexão da posição da câmera
  let mirroredPosition = camera.position.clone();
  mirroredPosition.sub(
    normal.clone().multiplyScalar(2 * (camera.position.dot(normal) - d))
  );
  mirrorCamera.position.copy(mirroredPosition);

  // Espelha a orientação da câmera
  mirrorCamera.lookAt(planeRefraction.position);
  mirrorCamera.updateProjectionMatrix();
}

// ====== Enable Clipping Plane ======
const mirrorNormal = new THREE.Vector3(1, 0, 0);
mirrorNormal.applyQuaternion(planeRefraction.quaternion);
const mirrorPlaneClip = new THREE.Plane(mirrorNormal, -planeRefraction.position.dot(mirrorNormal*2));

renderer.clippingPlanes = [mirrorPlaneClip];
renderer.localClippingEnabled = true;

// // ====== Animation Loop ======
function animate() {
  // Update mirror camera
  updateMirrorCamera(camera, planeRefraction, mirrorCamera);

  // Render reflection first
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, mirrorCamera);
  renderer.setRenderTarget(null);

  // Render the full scene
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
  // controls.update();
}

animate();
