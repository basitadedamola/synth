// createCyberGridVisualizer.ts
import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createCyberGridVisualizer = (
  scene: THREE.Scene,
  params: VisualizerParams
): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const gridSize = 20;
  const gridDivisions = 30;

  // Create glowing grid lines
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions: number[] = [];
  const gridColors: number[] = [];

  for (let i = 0; i <= gridDivisions; i++) {
    const x = (i / gridDivisions - 0.5) * gridSize;

    // X lines (along Z)
    gridPositions.push(x, 0, -gridSize / 2, x, 0, gridSize / 2);

    // Z lines (along X)
    gridPositions.push(-gridSize / 2, 0, x, gridSize / 2, 0, x);

    const color = new THREE.Color().setHSL(0.6, 1.0, 0.5);
    for (let j = 0; j < 4; j++) gridColors.push(color.r, color.g, color.b);
  }

  gridGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(gridPositions, 3)
  );
  gridGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(gridColors, 3)
  );

  const gridMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
  });

  const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
  grid.userData.type = "cyberGrid";
  grid.userData.baseY = 0;
  scene.add(grid);
  objects.push(grid);

  // Floating nodes
  const nodeCount = Math.min(params.particleCount, 200);
  for (let i = 0; i < nodeCount; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.9, 0.7),
      transparent: true,
      opacity: 0.8,
    });

    const node = new THREE.Mesh(geometry, material);
    node.position.set(
      Math.random() * gridSize - gridSize / 2,
      Math.random() * 2 - 1,
      Math.random() * gridSize - gridSize / 2
    );

    node.userData = {
      basePosition: node.position.clone(),
      speed: 0.1 + Math.random() * 0.2,
      index: i,
    };

    scene.add(node);
    objects.push(node);
  }

  return objects;
};
