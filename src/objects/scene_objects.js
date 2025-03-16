import * as THREE from "three";

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshPhongMaterial({ color: 
    "red",

   }),
);

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 10, 10),
  new THREE.MeshPhongMaterial({
     color: "white",
    })
);



export default {
  cube,
  sphere,
};
