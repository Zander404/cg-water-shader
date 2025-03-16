import * as THREE from "three";

// Limit of the ROOM
const ROOM_BOUNDS = {
  minX: -50/2,
  maxX: 50/2,
  minY: 0,
  maxY: 100/2,
  minZ: -50/2,
  maxZ: 50/2,
};

// ==================== Scene Walls ==========================

const geometryPlaneRoom = new THREE.PlaneGeometry(100, 100);

// Ceiling (Blue)
const planeTop = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "blue" })
);
planeTop.position.set(0, 100, 0);
planeTop.rotateX(Math.PI / 2);

// Floor (Red)
const planeBottom = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "red" })
);
planeBottom.rotateX(-Math.PI / 2);

// Left Wall (Green)
const planeLeft = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "green" })
);
planeLeft.rotateY(Math.PI / 2);
planeLeft.position.set(-50, 50, 0);

// Right Wall (Blue)
const planeRight = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "brown" })
);
planeRight.rotateY(-Math.PI / 2);
planeRight.position.set(50, 50, 0);

// Back Wall (Orange)
const planeBack = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "purple" })
);
planeBack.position.set(0, 50, -50);

// Front Wall (Yellow)
const planeFront = new THREE.Mesh(
  geometryPlaneRoom,
  new THREE.MeshBasicMaterial({ color: "yellow" })
);

planeFront.position.set(0, 50, 50);
planeFront.rotateY(-Math.PI);
// ===================================================================

export default {
  planeBack,
  planeBottom,
  planeFront,
  planeLeft,
  planeRight,
  planeTop,
  ROOM_BOUNDS,
};
