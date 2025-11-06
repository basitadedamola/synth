import * as THREE from "three";
import { VisualizerParams } from "../../types/visualizer";

export const createLiquidVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const resolution = 32;
  const geometry = new THREE.PlaneGeometry(
    10,
    10,
    resolution - 1,
    resolution - 1
  );

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(0.6, 0.8, 0.5),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: params.wireframe,
  });

  const liquidSurface = new THREE.Mesh(geometry, material);
  liquidSurface.rotation.x = -Math.PI / 2;
  liquidSurface.userData = {
    type: "liquid",
    resolution,
    originalVertices: geometry.attributes.position.array.slice(),
    waveCenters: Array.from({ length: 5 }, () => ({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      time: Math.random() * Math.PI * 2,
    })),
  };

  scene.add(liquidSurface);
  objects.push(liquidSurface);

  // Add floating particles
  const particleCount = Math.min(params.particleCount, 500);
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = Math.random() * 8 - 4;
    positions[i3 + 1] = Math.random() * 2;
    positions[i3 + 2] = Math.random() * 8 - 4;

    const hue = Math.random() * 0.3 + 0.5;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.userData.type = "liquidParticles";
  scene.add(particles);
  objects.push(particles);

  return objects;
};