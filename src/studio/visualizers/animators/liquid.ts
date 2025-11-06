import * as THREE from "three";
import { VisualizerParams, BeatInfo } from "../../types/visualizer";

export const animateLiquid = (
  objects: THREE.Object3D[],
  frequencyData: Uint8Array,
  time: number,
  params: VisualizerParams,
  beatInfo?: BeatInfo
): void => {
  objects.forEach((obj) => {
    if (obj.userData.type === "liquid") {
      // Type guard for Mesh with PlaneGeometry
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry) {
        const geometry = obj.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const originalVertices = obj.userData.originalVertices as Float32Array;
        const resolution = obj.userData.resolution;

        for (let i = 0; i < positions.length; i += 3) {
          const vertexIndex = i / 3;
          const x = originalVertices[i];
          const z = originalVertices[i + 2];

          let waveHeight = 0;

          // Multiple wave sources
          obj.userData.waveCenters.forEach((center: any) => {
            const distance = Math.sqrt((x - center.x) ** 2 + (z - center.y) ** 2);
            waveHeight += Math.sin(distance * 2 - (time + center.time) * 3) * 0.5;
          });

          // Audio reactivity
          const dataIndex = Math.floor(
            (vertexIndex / positions.length) * frequencyData.length
          );
          const audioInfluence =
            (frequencyData[dataIndex] / 255) * params.fluidity * 0.01;

          positions[i + 1] =
            originalVertices[i + 1] + waveHeight * 0.5 + audioInfluence * 2;
        }

        geometry.attributes.position.needsUpdate = true;
      }
    } else if (obj.userData.type === "liquidParticles") {
      // Type guard for Points with BufferGeometry
      if (obj instanceof THREE.Points && obj.geometry instanceof THREE.BufferGeometry) {
        const geometry = obj.geometry;
        const positions = geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
          // Floating motion
          positions[i + 1] += Math.sin(time + i * 0.01) * 0.01;

          // Reset if too high
          if (positions[i + 1] > 2) {
            positions[i + 1] = 0;
          }
        }

        geometry.attributes.position.needsUpdate = true;
      }
    }
  });
};