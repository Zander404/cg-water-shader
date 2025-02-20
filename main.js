import * as THREE from "three";

// Cena, Câmera e Renderizador
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

// Luzes
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Objetos com Textura Padrão
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("texture.jpg"); // Substitua pelo caminho da textura

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(-2, 2, -5);
scene.add(sphere);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(2, 2, -5);
scene.add(cube);

// Render Targets para Reflexão e Transparência
const reflectionRenderTarget = new THREE.WebGLRenderTarget(512, 512);
const transparencyRenderTarget = new THREE.WebGLRenderTarget(512, 512);




// Shader de Vértice
const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Shader de Fragmento
const fragmentShader = `
  uniform sampler2D reflectionTexture;
  uniform sampler2D transparencyTexture;
  uniform float transparency;
  uniform float time;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Distorção para simular refração
    vec2 distortion = vec2(
      sin(vPosition.x * 5.0 + time) * 0.05,
      cos(vPosition.y * 5.0 + time) * 0.05
    );

    // Amostrar texturas de reflexão e transparência
    vec3 reflectionColor = texture2D(reflectionTexture, vUv + distortion).rgb;
    vec3 transparencyColor = texture2D(transparencyTexture, vUv - distortion).rgb;

    // Efeito de Fresnel para misturar reflexão e transparência
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 1.0, 0.0)), 2.0);
    vec3 finalColor = mix(transparencyColor, reflectionColor, fresnel);

    // Aplicar transparência
    gl_FragColor = vec4(finalColor, transparency);
  }
`;

// Material do Plano
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    reflectionTexture: { value: reflectionRenderTarget.texture },
    transparencyTexture: { value: transparencyRenderTarget.texture },
    transparency: { value: 0.7 }, // Controle de transparência
    time: { value: 0.0 }
  },
  side: THREE.DoubleSide,
  transparent: true
});

// Plano
const planeGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);



// Câmera para Reflexão
const reflectionCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
reflectionCamera.position.set(0, 5, 10);
reflectionCamera.lookAt(0, 0, 0);

// Animação
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Atualizar o tempo para o shader
  planeMaterial.uniforms.time.value = clock.getElapsedTime();

  // Renderizar cena refletida
  sphere.visible = true;
  cube.visible = true;
  renderer.setRenderTarget(reflectionRenderTarget);
  renderer.render(scene, reflectionCamera);

  // Renderizar cena transparente
  sphere.visible = false; // Ocultar objetos acima do plano
  cube.visible = false;
  renderer.setRenderTarget(transparencyRenderTarget);
  renderer.render(scene, camera);

  // Renderizar cena final
  sphere.visible = true;
  cube.visible = true;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();