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


export interface BaseCustomization {
  color: string;
  opacity: number;
  intensity: number;
  responseTo?: 'bass' | 'mid' | 'treble' | 'beat' | 'overall';
}

export interface ParticleCustomization extends BaseCustomization {
  size: number;
  speed: number;
  count: number;
  spawnRate?: number;
  lifetime?: number;
}

export interface LightCustomization extends BaseCustomization {
  position?: [number, number, number];
  distance?: number;
  decay?: number;
}

export interface GridCustomization extends BaseCustomization {
  size: number;
  divisions: number;
  lineWidth?: number;
}

export interface BackgroundCustomization {
  color: string;
  gradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  opacity: number;
}

export interface ShapeCustomization extends BaseCustomization {
  geometry: 'cube' | 'sphere' | 'cone' | 'torus';
  size: number;
  rotationSpeed: number;
  wireframe?: boolean;
}

export interface WaveCustomization extends BaseCustomization {
  amplitude: number;
  frequency: number;
  speed: number;
  points?: number;
}

export type Customization = 
  | ParticleCustomization
  | LightCustomization
  | GridCustomization
  | BackgroundCustomization
  | ShapeCustomization
  | WaveCustomization;

export interface VisualElement {
  id: string;
  type: 'particle' | 'shape' | 'light' | 'grid' | 'wave' | 'background';
  name: string;
  visible: boolean;
  customization: Customization;
}