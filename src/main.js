import * as THREE from "three";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";

import { OrbitControls } from "three/examples/jsm/Addons.js";

// WORLD
const rendered = new THREE.WebGLRenderer();
rendered.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(rendered.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const controls = new OrbitControls(camera, rendered.domElement);

controls.update();

// OBJECTS

//Plane 
const geometryPlane = new THREE.PlaneGeometry(0.75, 0.75, 64,64);
const materialPlane = new THREE.RawShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometryPlane, materialPlane);
scene.add(plane);
console.log(plane.geometry)

// ADD Ondulation to Plane

const amount = geometryPlane.attributes.position.count;
const newAtributeArray = new Float32Array(amount);

for(let i = 0; i<amount; i++){
    newAtributeArray[i] = i%2;
}


geometryPlane.setAttribute("a_modulus", new THREE.BufferAttribute(newAtributeArray,1));


// RENDER
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  rendered.render(scene, camera);
}

animate();
