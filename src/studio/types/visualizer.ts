import * as THREE from "three";

export interface VisualizerParams {
  visualizerType:
    | "spectrum"
    | "particleWave"
    | "orbital"
    | "tunnel"
    | "nebula"
    | "crystal"
    | "geometric"
    | "waveform3D"
    | "fractal"
    | "audioReactive"
    | "morphing"
    | "liquid"
    | "quantum"
    | "hologram"
    | "neural"
    | "cyberGrid"
    | "biomorphic";
  colorScheme:
    | "cyberpunk"
    | "ocean"
    | "sunset"
    | "forest"
    | "neon"
    | "monochrome"
    | "rainbow"
    | "plasma"
    | "aurora"
    | "fire"
    | "ice";
  intensity: number;
  speed: number;
  rotationSpeed: number;
  particleCount: number;
  bloom: boolean;
  wireframe: boolean;
  mirrorEffect: boolean;
  complexity: number;
  scale: number;
  bassBoost: boolean;
  reverb: boolean;
  frequencyRange: [number, number];
  smoothing: number;
  beatDetection: boolean;
  patternDensity: number;
  objectSize: number;
  morphSpeed: number;
  fluidity: number;
  glowIntensity: number;
  reactionSpeed: number;
}

export interface BeatInfo {
  isBeat: boolean;
  strength: number;
  bandStrengths: Record<string, number>;
}

export interface VisualizerComponent {
  create: (scene: THREE.Scene, params: VisualizerParams) => THREE.Object3D[];
  animate: (
    objects: THREE.Object3D[],
    frequencyData: Uint8Array,
    time: number,
    params: VisualizerParams,
    beatInfo: BeatInfo
  ) => void;
}