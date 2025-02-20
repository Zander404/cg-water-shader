import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

// Define the camera position and scene of the camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);


// Start the render of the scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Create the Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// reposition the positon of the camera, to far of the object
camera.position.z = 5;


//  Function to Animate the cube
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  
}



// Test if the browser have WEBGL to render the scene
if (WebGL.isWebGL2Available()) {
  renderer.setAnimationLoop(animate)
  
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  document.getElementById("container").appendChild(warning);
}
