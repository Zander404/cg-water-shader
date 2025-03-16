import * as THREE from "three";

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "white" }),
);

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "white" })
);

export default {
  cube,
  sphere,
};
