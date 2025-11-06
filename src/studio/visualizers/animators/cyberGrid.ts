// animateCyberGrid.ts
import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateCyberGrid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    // Animate grid lines
    if (obj.userData.type === "cyberGrid") {
      if (obj instanceof THREE.LineSegments && obj.geometry instanceof THREE.BufferGeometry) {
        const positions = obj.geometry.attributes.position.array as Float32Array;
        const baseY = obj.userData.baseY ?? 0;

        for (let i = 0; i < positions.length; i += 3) {
          const pulse = Math.sin(time * 2 + positions[i] * 0.1) * 0.1;
          positions[i + 1] = baseY + pulse;
        }

        obj.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Animate floating nodes (only if valid)
    if (obj instanceof THREE.Mesh && obj.userData.basePosition) {
      const basePosition = obj.userData.basePosition as THREE.Vector3;
      const speed = obj.userData.speed ?? 0.1;
      const index = obj.userData.index ?? 0;

      obj.position.y = basePosition.y + Math.sin(time * speed) * 0.5;
      obj.position.x = basePosition.x + Math.cos(time * speed * 0.7) * 0.3;

      const dataIndex = Math.floor((index / objects.length) * frequencyData.length);
      const scale = 1 + (frequencyData[dataIndex] / 255) * 0.5;
      obj.scale.set(scale, scale, scale);
    }
  });
};
