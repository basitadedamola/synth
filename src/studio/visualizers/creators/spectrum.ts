import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createSpectrumVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bars = 64;

  for (let i = 0; i < bars; i++) {
    const geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / bars, 0.9, 0.6),
      transparent: true,
      opacity: 0.8,
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = (i - bars / 2) * 0.15;
    bar.position.y = 0.5;
    bar.userData = { index: i, baseHeight: 1 };

    scene.add(bar);
    objects.push(bar);
  }

  return objects;
};