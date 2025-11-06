// import React, { useState, useEffect, useRef } from "react";
// import {
//   Play,
//   Pause,
//   Download,
//   Wand2,
//   Trash2,
//   Volume2,
//   Upload,
//   Music,
// } from "lucide-react";
// import { Button } from "./ui/Button";
// import { Slider } from "./ui/Slider";
// import * as THREE from "three";

// // Types
// interface VisualizerParams {
//   visualizerType:
//     | "spectrum"
//     | "particleWave"
//     | "orbital"
//     | "tunnel"
//     | "nebula"
//     | "crystal"
//     | "geometric"
//     | "waveform3D"
//     | "fractal"
//     | "audioReactive"
//     | "morphing"
//     | "liquid"
//     | "quantum"
//     | "hologram"
//     | "neural"
//     | "cyberGrid"
//     | "biomorphic";
//   colorScheme:
//     | "cyberpunk"
//     | "ocean"
//     | "sunset"
//     | "forest"
//     | "neon"
//     | "monochrome"
//     | "rainbow"
//     | "plasma"
//     | "aurora"
//     | "fire"
//     | "ice";
//   intensity: number;
//   speed: number;
//   rotationSpeed: number;
//   particleCount: number;
//   bloom: boolean;
//   wireframe: boolean;
//   mirrorEffect: boolean;
//   complexity: number;
//   scale: number;
//   bassBoost: boolean;
//   reverb: boolean;
//   frequencyRange: [number, number];
//   smoothing: number;
//   beatDetection: boolean;
//   patternDensity: number;
//   objectSize: number;
//   morphSpeed: number;
//   fluidity: number;
//   glowIntensity: number;
//   reactionSpeed: number;
// }

// // Fixed Audio Manager with proper file handling and default audio
// class AudioManager {
//   private audioContext: AudioContext | null = null;
//   private analyser: AnalyserNode | null = null;
//   private source: MediaElementAudioSourceNode | null = null;
//   private audioElement: HTMLAudioElement | null = null;
//   private dataArray: Uint8Array | null = null;
//   private beatCutoff: number = 0;
//   private beatTime: number = 0;
//   private isInitialized: boolean = false;
//   private defaultSource: AudioBufferSourceNode | null = null;
//   private isDefaultAudioPlaying: boolean = false;
//   private progressCallbacks: ((currentTime: number, duration: number) => void)[] = [];

//   // Frequency bands for detailed analysis
//   private frequencyBands = {
//     bass: [20, 250],
//     lowMid: [250, 500],
//     mid: [500, 2000],
//     highMid: [2000, 6000],
//     treble: [6000, 20000],
//   };

//   async initialize() {
//     if (this.isInitialized) return;

//     try {
//       this.audioContext = new (window.AudioContext ||
//         (window as any).webkitAudioContext)();
//       this.analyser = this.audioContext.createAnalyser();
//       this.analyser.fftSize = 4096;
//       this.analyser.smoothingTimeConstant = 0.7;

//       this.audioElement = new Audio();
//       this.audioElement.crossOrigin = "anonymous";

//       this.source = this.audioContext.createMediaElementSource(
//         this.audioElement
//       );
//       this.source.connect(this.analyser);
//       this.analyser.connect(this.audioContext.destination);

//       this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
//       this.isInitialized = true;

//       console.log("Audio manager initialized successfully");
//     } catch (error) {
//       console.error("Audio setup failed:", error);
//       this.isInitialized = false;
//     }
//   }

//   async loadAudioFile(file: File): Promise<boolean> {
//     if (!this.isInitialized) {
//       await this.initialize();
//     }

//     // Stop any currently playing audio
//     this.pause();
//     this.isDefaultAudioPlaying = false;

//     // 🔧 FIX: Ensure audioElement always exists
//     if (!this.audioElement) {
//       this.audioElement = new Audio();
//       this.audioElement.crossOrigin = "anonymous";

//       // Reconnect it to the analyser
//       if (this.audioContext && this.analyser) {
//         this.source = this.audioContext.createMediaElementSource(
//           this.audioElement
//         );
//         this.source.connect(this.analyser);
//         this.analyser.connect(this.audioContext.destination);
//       }
//     }

//     return new Promise((resolve) => {
//       const url = URL.createObjectURL(file);
//       this.audioElement!.src = url;

//       // Set up progress tracking for uploaded audio
//       this.audioElement!.ontimeupdate = () => {
//         this.notifyProgressCallbacks();
//       };

//       this.audioElement!.onended = () => {
//         this.isDefaultAudioPlaying = false;
//         this.notifyProgressCallbacks();
//       };

//       this.audioElement!.oncanplaythrough = () => {
//         console.log("✅ Audio can play through:", file.name);
//         resolve(true);
//       };

//       this.audioElement!.onerror = (error) => {
//         console.error("❌ Error loading audio file:", error);
//         URL.revokeObjectURL(url);
//         resolve(false);
//       };
//     });
//   }

//   // Load default demo audio (sine wave generated programmatically)
//   async loadDefaultAudio(): Promise<boolean> {
//     if (!this.isInitialized) {
//       await this.initialize();
//     }

//     try {
//       // Stop any currently playing audio
//       this.pause();

//       // Generate a simple sine wave as default audio
//       const duration = 10; // seconds
//       const sampleRate = 44100;
//       const numberOfSamples = duration * sampleRate;
//       const audioBuffer = this.audioContext!.createBuffer(
//         2,
//         numberOfSamples,
//         sampleRate
//       );

//       // Fill the buffer with a sine wave
//       for (let channel = 0; channel < 2; channel++) {
//         const channelData = audioBuffer.getChannelData(channel);
//         for (let i = 0; i < numberOfSamples; i++) {
//           // Create an interesting pattern with multiple frequencies
//           const t = i / sampleRate;
//           const freq1 = 220 + Math.sin(t * 0.5) * 110; // A3 to A4
//           const freq2 = 440 + Math.sin(t * 0.3) * 220; // A4 to A5
//           channelData[i] =
//             Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
//             Math.sin(2 * Math.PI * freq2 * t) * 0.2;
//         }
//       }

//       // Store for later use
//       this.defaultSource = this.audioContext!.createBufferSource();
//       this.defaultSource.buffer = audioBuffer;
//       this.defaultSource.connect(this.analyser!);
//       this.defaultSource.loop = true;

//       // Set up progress tracking for default audio
//       this.defaultSource.onended = () => {
//         this.isDefaultAudioPlaying = false;
//         this.notifyProgressCallbacks();
//       };

//       console.log("Default audio loaded successfully");
//       return true;
//     } catch (error) {
//       console.error("Error loading default audio:", error);
//       return false;
//     }
//   }

//   async play(): Promise<void> {
//     if (!this.isInitialized) {
//       await this.initialize();
//     }

//     if (this.audioContext?.state === "suspended") {
//       await this.audioContext.resume();
//     }

//     if (this.audioElement && this.audioElement.src) {
//       // User uploaded audio
//       try {
//         await this.audioElement.play();
//         // Start progress tracking
//         this.startProgressTracking();
//       } catch (error) {
//         console.error("Play failed:", error);
//         throw error;
//       }
//     } else if (this.defaultSource) {
//       // Default audio
//       try {
//         this.defaultSource.start();
//         this.isDefaultAudioPlaying = true;
//         // Start progress tracking for default audio
//         this.startProgressTracking();
//       } catch (error) {
//         console.error("Default audio play failed:", error);
//         // Recreate default audio if it can't be started
//         await this.loadDefaultAudio();
//         this.defaultSource!.start();
//         this.isDefaultAudioPlaying = true;
//         this.startProgressTracking();
//       }
//     }
//   }

//   pause(): void {
//     if (this.audioElement) {
//       this.audioElement.pause();
//     }
//     if (this.defaultSource && this.isDefaultAudioPlaying) {
//       try {
//         this.defaultSource.stop();
//         this.isDefaultAudioPlaying = false;
//       } catch (error) {
//         console.warn("Error stopping default source:", error);
//       }
//       // Recreate for next play
//       this.loadDefaultAudio();
//     }
//     this.stopProgressTracking();
//   }

//   getFrequencyData(): Uint8Array {
//     if (!this.analyser || !this.dataArray) {
//       return new Uint8Array(1024);
//     }
//     this.analyser.getByteFrequencyData(this.dataArray);
//     return this.dataArray;
//   }

//   getTimeDomainData(): Uint8Array {
//     if (!this.analyser || !this.dataArray) {
//       return new Uint8Array(1024);
//     }
//     this.analyser.getByteTimeDomainData(this.dataArray);
//     return this.dataArray;
//   }

//   // Enhanced beat detection with frequency band analysis
//   detectBeat(frequencyData: Uint8Array): {
//     isBeat: boolean;
//     strength: number;
//     bandStrengths: Record<string, number>;
//   } {
//     const bandStrengths: Record<string, number> = {};
//     let totalEnergy = 0;

//     // Calculate energy for each frequency band
//     Object.entries(this.frequencyBands).forEach(([band, [low, high]]) => {
//       const lowIndex = Math.floor((low / 20000) * frequencyData.length);
//       const highIndex = Math.floor((high / 20000) * frequencyData.length);

//       let energy = 0;
//       const count = highIndex - lowIndex;

//       if (count > 0) {
//         for (let i = lowIndex; i < highIndex; i++) {
//           energy += frequencyData[i];
//         }
//         energy /= count;
//       }

//       bandStrengths[band] = energy / 255;
//       totalEnergy += energy;
//     });

//     const averageEnergy = totalEnergy / 5 / 255;
//     const currentTime = Date.now();

//     // Dynamic threshold based on recent history
//     const isBeat =
//       averageEnergy > this.beatCutoff && currentTime - this.beatTime > 200;

//     if (isBeat) {
//       this.beatTime = currentTime;
//       this.beatCutoff = averageEnergy * 1.3;
//     } else {
//       this.beatCutoff *= 0.95; // Decay threshold
//     }

//     return {
//       isBeat,
//       strength: averageEnergy,
//       bandStrengths,
//     };
//   }

//   getBassLevel(frequencyData: Uint8Array): number {
//     const [low, high] = this.frequencyBands.bass;
//     const lowIndex = Math.floor((low / 20000) * frequencyData.length);
//     const highIndex = Math.floor((high / 20000) * frequencyData.length);

//     let bassEnergy = 0;
//     const count = highIndex - lowIndex;

//     if (count > 0) {
//       for (let i = lowIndex; i < highIndex; i++) {
//         bassEnergy += frequencyData[i];
//       }
//       bassEnergy /= count;
//     }

//     return bassEnergy / 255 || 0;
//   }

//   isPlaying(): boolean {
//     if (this.audioElement) {
//       return !this.audioElement.paused && !this.audioElement.ended;
//     }
//     return this.isDefaultAudioPlaying;
//   }

//   getDuration(): number {
//     if (this.audioElement && this.audioElement.duration) {
//       return this.audioElement.duration;
//     }
//     return this.defaultSource?.buffer?.duration || 10; // Default audio is 10 seconds
//   }

//   getCurrentTime(): number {
//     if (this.audioElement) {
//       return this.audioElement.currentTime || 0;
//     }
//     return this.defaultSource?.context?.currentTime || 0;
//   }

//   onTimeUpdate(callback: (currentTime: number, duration: number) => void) {
//     this.progressCallbacks.push(callback);
//   }

//   offTimeUpdate(callback: (currentTime: number, duration: number) => void) {
//     this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
//   }

//   private notifyProgressCallbacks() {
//     const currentTime = this.getCurrentTime();
//     const duration = this.getDuration();
//     this.progressCallbacks.forEach(callback => {
//       try {
//         callback(currentTime, duration);
//       } catch (error) {
//         console.error("Progress callback error:", error);
//       }
//     });
//   }

//   private progressInterval: number | null = null;

//   private startProgressTracking() {
//     this.stopProgressTracking();
//     this.progressInterval = window.setInterval(() => {
//       this.notifyProgressCallbacks();
//     }, 100); // Update every 100ms
//   }

//   private stopProgressTracking() {
//     if (this.progressInterval) {
//       clearInterval(this.progressInterval);
//       this.progressInterval = null;
//     }
//   }

//   // 🎚️ Seek to specific time (used by progress bar drag)
//   seekTo(time: number) {
//     if (this.audioElement) {
//       this.audioElement.currentTime = time;
//     }
//     // Note: Seeking not supported for default audio
//   }

//   cleanup() {
//     try {
//       this.stopProgressTracking();
//       this.progressCallbacks = [];

//       // Stop and clear uploaded audio
//       if (this.audioElement) {
//         this.audioElement.pause();
//         this.audioElement.src = "";
//         this.audioElement.load(); // Reset element
//       }

//       // Stop generated default audio safely
//       if (this.defaultSource) {
//         try {
//           this.defaultSource.stop();
//         } catch (stopError) {
//           console.warn("⚠️ Default source stop skipped:", stopError);
//         }
//         this.defaultSource = null;
//       }

//       this.isDefaultAudioPlaying = false;

//       // Close context
//       if (this.audioContext) {
//         this.audioContext.close().catch(console.error);
//         this.audioContext = null;
//       }

//       this.isInitialized = false;
//       console.log("🧹 AudioManager cleaned up safely");
//     } catch (error) {
//       console.error("❌ Error during AudioManager cleanup:", error);
//     }
//   }
// }

// // [Keep all the visualizer creation functions the same as before]
// const createSpectrumVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const bars = 64;

//   for (let i = 0; i < bars; i++) {
//     const geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
//     const material = new THREE.MeshPhongMaterial({
//       color: new THREE.Color().setHSL(i / bars, 0.9, 0.6),
//       transparent: true,
//       opacity: 0.8,
//     });

//     const bar = new THREE.Mesh(geometry, material);
//     bar.position.x = (i - bars / 2) * 0.15;
//     bar.position.y = 0.5;
//     bar.userData = { index: i, baseHeight: 1 };

//     scene.add(bar);
//     objects.push(bar);
//   }

//   return objects;
// };

// const createParticleWaveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const particleCount = Math.min(params.particleCount, 5000);
//   const geometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(particleCount * 3);
//   const colors = new Float32Array(particleCount * 3);

//   for (let i = 0; i < particleCount; i++) {
//     const i3 = i * 3;
//     positions[i3] = (Math.random() - 0.5) * 20;
//     positions[i3 + 1] = (Math.random() - 0.5) * 10;
//     positions[i3 + 2] = (Math.random() - 0.5) * 20;

//     const hue = Math.random();
//     const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
//     colors[i3] = color.r;
//     colors[i3 + 1] = color.g;
//     colors[i3 + 2] = color.b;
//   }

//   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//   geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//   const material = new THREE.PointsMaterial({
//     size: 0.1,
//     vertexColors: true,
//     transparent: true,
//   });

//   const particles = new THREE.Points(geometry, material);
//   particles.userData = {
//     type: "particleWave",
//     originalPositions: positions.slice(),
//   };
//   scene.add(particles);
//   objects.push(particles);

//   return objects;
// };

// const createGeometricVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const shapes = ["box", "sphere", "cone", "torus"];
//   const count = Math.floor(params.complexity);

//   for (let i = 0; i < count; i++) {
//     let geometry: THREE.BufferGeometry;
//     const shapeType = shapes[i % shapes.length];

//     switch (shapeType) {
//       case "box":
//         geometry = new THREE.BoxGeometry(1, 1, 1);
//         break;
//       case "sphere":
//         geometry = new THREE.SphereGeometry(0.7, 16, 16);
//         break;
//       case "cone":
//         geometry = new THREE.ConeGeometry(0.5, 1.5, 16);
//         break;
//       case "torus":
//         geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
//         break;
//       default:
//         geometry = new THREE.BoxGeometry(1, 1, 1);
//     }

//     const material = new THREE.MeshPhongMaterial({
//       color: new THREE.Color().setHSL(i / count, 0.8, 0.6),
//       wireframe: params.wireframe,
//       transparent: true,
//       opacity: 0.7,
//     });

//     const mesh = new THREE.Mesh(geometry, material);

//     const angle = (i / count) * Math.PI * 2;
//     const radius = 3 + Math.sin(i) * 2;
//     mesh.position.set(
//       Math.cos(angle) * radius,
//       Math.sin(angle) * 0.5,
//       Math.sin(angle) * radius
//     );

//     mesh.userData = {
//       index: i,
//       basePosition: mesh.position.clone(),
//       shapeType: shapeType,
//     };

//     scene.add(mesh);
//     objects.push(mesh);
//   }

//   return objects;
// };

// const createWaveform3DVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const points = 128;
//   const geometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(points * 3);

//   for (let i = 0; i < points; i++) {
//     const i3 = i * 3;
//     positions[i3] = (i - points / 2) * 0.1;
//     positions[i3 + 1] = 0;
//     positions[i3 + 2] = 0;
//   }

//   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

//   const material = new THREE.LineBasicMaterial({
//     color: 0x00ffff,
//     transparent: true,
//     opacity: 0.8,
//   });

//   const waveform = new THREE.Line(geometry, material);
//   waveform.userData = {
//     type: "waveform3D",
//     points: points,
//     originalPositions: positions.slice(),
//   };
//   scene.add(waveform);
//   objects.push(waveform);

//   return objects;
// };

// const createAudioReactiveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const rings = 8;
//   const segments = 64;

//   for (let ring = 0; ring < rings; ring++) {
//     const radius = 2 + ring * 1.5;
//     const geometry = new THREE.TorusGeometry(radius, 0.3, 16, segments);
//     const material = new THREE.MeshPhongMaterial({
//       color: new THREE.Color().setHSL(ring / rings, 0.9, 0.6),
//       transparent: true,
//       opacity: 0.8,
//     });

//     const torus = new THREE.Mesh(geometry, material);
//     torus.rotation.x = Math.PI / 2;
//     torus.userData = { ring, radius, segments };

//     scene.add(torus);
//     objects.push(torus);
//   }

//   return objects;
// };

// const createMorphingVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const count = Math.floor(params.complexity * 2);

//   for (let i = 0; i < count; i++) {
//     const geometry = new THREE.IcosahedronGeometry(1, 1);
//     const material = new THREE.MeshPhongMaterial({
//       color: new THREE.Color().setHSL((i / count) * 0.8, 0.9, 0.6),
//       wireframe: params.wireframe,
//       transparent: true,
//       opacity: 0.7,
//     });

//     const mesh = new THREE.Mesh(geometry, material);

//     const angle = (i / count) * Math.PI * 2;
//     const radius = 3 + Math.sin(i) * 2;
//     mesh.position.set(
//       Math.cos(angle) * radius,
//       Math.sin(angle) * 0.5,
//       Math.sin(angle) * radius
//     );

//     mesh.userData = {
//       index: i,
//       baseScale: 0.5 + Math.random() * 0.5,
//       morphSpeed: 0.5 + Math.random() * params.morphSpeed,
//       originalVertices: geometry.attributes.position.array.slice(),
//     };

//     scene.add(mesh);
//     objects.push(mesh);
//   }

//   return objects;
// };

// const createLiquidVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const resolution = 32;
//   const geometry = new THREE.PlaneGeometry(
//     10,
//     10,
//     resolution - 1,
//     resolution - 1
//   );

//   const material = new THREE.MeshPhongMaterial({
//     color: new THREE.Color().setHSL(0.6, 0.8, 0.5),
//     transparent: true,
//     opacity: 0.9,
//     side: THREE.DoubleSide,
//     wireframe: params.wireframe,
//   });

//   const liquidSurface = new THREE.Mesh(geometry, material);
//   liquidSurface.rotation.x = -Math.PI / 2;
//   liquidSurface.userData = {
//     type: "liquid",
//     resolution,
//     originalVertices: geometry.attributes.position.array.slice(),
//     waveCenters: Array.from({ length: 5 }, () => ({
//       x: Math.random() * 10 - 5,
//       y: Math.random() * 10 - 5,
//       time: Math.random() * Math.PI * 2,
//     })),
//   };

//   scene.add(liquidSurface);
//   objects.push(liquidSurface);

//   // Add floating particles
//   const particleCount = Math.min(params.particleCount, 500);
//   const particleGeometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(particleCount * 3);
//   const colors = new Float32Array(particleCount * 3);

//   for (let i = 0; i < particleCount; i++) {
//     const i3 = i * 3;
//     positions[i3] = Math.random() * 8 - 4;
//     positions[i3 + 1] = Math.random() * 2;
//     positions[i3 + 2] = Math.random() * 8 - 4;

//     const hue = Math.random() * 0.3 + 0.5;
//     const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
//     colors[i3] = color.r;
//     colors[i3 + 1] = color.g;
//     colors[i3 + 2] = color.b;
//   }

//   particleGeometry.setAttribute(
//     "position",
//     new THREE.BufferAttribute(positions, 3)
//   );
//   particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//   const particleMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     vertexColors: true,
//     transparent: true,
//   });

//   const particles = new THREE.Points(particleGeometry, particleMaterial);
//   particles.userData.type = "liquidParticles";
//   scene.add(particles);
//   objects.push(particles);

//   return objects;
// };

// const createCyberGridVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const gridSize = 20;
//   const gridDivisions = 30;

//   // Create grid lines
//   const gridGeometry = new THREE.BufferGeometry();
//   const gridPositions = [];
//   const gridColors = [];

//   for (let i = 0; i <= gridDivisions; i++) {
//     const x = (i / gridDivisions - 0.5) * gridSize;

//     // X lines
//     gridPositions.push(x, -gridSize / 2, 0);
//     gridPositions.push(x, gridSize / 2, 0);

//     // Z lines
//     gridPositions.push(-gridSize / 2, 0, x);
//     gridPositions.push(gridSize / 2, 0, x);

//     const color = new THREE.Color().setHSL(0.7, 0.9, 0.4);
//     for (let j = 0; j < 4; j++) {
//       gridColors.push(color.r, color.g, color.b);
//     }
//   }

//   gridGeometry.setAttribute(
//     "position",
//     new THREE.Float32BufferAttribute(gridPositions, 3)
//   );
//   gridGeometry.setAttribute(
//     "color",
//     new THREE.Float32BufferAttribute(gridColors, 3)
//   );

//   const gridMaterial = new THREE.LineBasicMaterial({
//     vertexColors: true,
//     transparent: true,
//     opacity: 0.6,
//   });

//   const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
//   grid.userData.type = "cyberGrid";
//   scene.add(grid);
//   objects.push(grid);

//   // Add floating nodes
//   const nodeCount = Math.min(params.particleCount, 200);
//   for (let i = 0; i < nodeCount; i++) {
//     const geometry = new THREE.SphereGeometry(0.1, 8, 8);
//     const material = new THREE.MeshBasicMaterial({
//       color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.9, 0.7),
//       transparent: true,
//       opacity: 0.8,
//     });

//     const node = new THREE.Mesh(geometry, material);
//     node.position.set(
//       Math.random() * gridSize - gridSize / 2,
//       Math.random() * 2 - 1,
//       Math.random() * gridSize - gridSize / 2
//     );

//     node.userData = {
//       basePosition: node.position.clone(),
//       speed: 0.1 + Math.random() * 0.2,
//     };

//     scene.add(node);
//     objects.push(node);
//   }

//   return objects;
// };

// const createBiomorphicVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
//   const objects: THREE.Object3D[] = [];
//   const branches = Math.floor(params.complexity * 3);

//   const createBranch = (
//     depth: number,
//     maxDepth: number,
//     position: THREE.Vector3,
//     direction: THREE.Vector3
//   ): THREE.Object3D => {
//     if (depth > maxDepth) return new THREE.Object3D();

//     const length = 1.5 / depth;
//     const geometry = new THREE.CylinderGeometry(0.02, 0.05, length, 8);
//     const material = new THREE.MeshPhongMaterial({
//       color: new THREE.Color().setHSL(0.3 + depth * 0.1, 0.8, 0.5),
//       transparent: true,
//       opacity: 0.8,
//     });

//     const segment = new THREE.Mesh(geometry, material);
//     segment.position.copy(position);
//     segment.lookAt(position.clone().add(direction));
//     segment.rotateX(Math.PI / 2);

//     const endPosition = position
//       .clone()
//       .add(direction.clone().multiplyScalar(length));

//     // Add recursive branches
//     if (depth < maxDepth) {
//       for (let i = 0; i < 2 + Math.floor(params.patternDensity); i++) {
//         const angle = (i / (2 + params.patternDensity)) * Math.PI * 2;
//         const childDirection = new THREE.Vector3(
//           Math.cos(angle) * 0.5,
//           Math.sin(angle) * 0.3,
//           Math.random() - 0.5
//         ).normalize();

//         const child = createBranch(
//           depth + 1,
//           maxDepth,
//           endPosition,
//           childDirection
//         );
//         segment.add(child);
//       }
//     }

//     segment.userData = {
//       depth,
//       length,
//       pulsePhase: Math.random() * Math.PI * 2,
//     };

//     return segment;
//   };

//   for (let i = 0; i < branches; i++) {
//     const angle = (i / branches) * Math.PI * 2;
//     const direction = new THREE.Vector3(
//       Math.cos(angle) * 0.5,
//       Math.random() - 0.5,
//       Math.sin(angle) * 0.5
//     ).normalize();

//     const branch = createBranch(
//       0,
//       3 + Math.floor(params.complexity / 2),
//       new THREE.Vector3(),
//       direction
//     );
//     branch.position.set(
//       Math.cos(angle) * 2,
//       Math.sin(i) * 1,
//       Math.sin(angle) * 2
//     );

//     scene.add(branch);
//     objects.push(branch);
//   }

//   return objects;
// };

// // [Keep all the animation functions the same as before]
// const animateSpectrum = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams
// ): void => {
//   objects.forEach((obj, index) => {
//     if (!(obj instanceof THREE.Mesh)) return;

//     const dataIndex = Math.floor(
//       (index / objects.length) * frequencyData.length
//     );
//     const frequencyValue = frequencyData[dataIndex] / 255;
//     const scaleY = 1 + frequencyValue * params.intensity * 0.1;

//     obj.scale.y = scaleY;
//     obj.position.y = scaleY / 2;

//     // Color animation
//     if (obj.material instanceof THREE.MeshPhongMaterial) {
//       const hue = (time * 0.1 + index * 0.01) % 1;
//       obj.material.color.setHSL(hue, 0.9, 0.6);
//     }
//   });
// };

// const animateParticleWave = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams
// ): void => {
//   objects.forEach((obj) => {
//     if (!(obj instanceof THREE.Points) || obj.userData.type !== "particleWave")
//       return;

//     const geometry = obj.geometry as THREE.BufferGeometry;
//     const positions = geometry.attributes.position.array as Float32Array;
//     const originalPositions = obj.userData.originalPositions as Float32Array;

//     for (let i = 0; i < positions.length / 3; i++) {
//       const i3 = i * 3;
//       const dataIndex = Math.floor(
//         (i / (positions.length / 3)) * frequencyData.length
//       );
//       const frequencyValue = frequencyData[dataIndex] / 255;

//       // Wave motion based on audio
//       const wave =
//         Math.sin(time * 2 + originalPositions[i3] * 0.5) * frequencyValue * 2;
//       positions[i3 + 1] = originalPositions[i3 + 1] + wave;

//       // Color animation
//       if (geometry.attributes.color) {
//         const colors = geometry.attributes.color.array as Float32Array;
//         const hue = (time * 0.1 + i * 0.001) % 1;
//         const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
//         colors[i3] = color.r;
//         colors[i3 + 1] = color.g;
//         colors[i3 + 2] = color.b;
//       }
//     }

//     geometry.attributes.position.needsUpdate = true;
//     if (geometry.attributes.color) {
//       geometry.attributes.color.needsUpdate = true;
//     }
//   });
// };

// const animateGeometric = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams
// ): void => {
//   objects.forEach((obj, index) => {
//     if (!(obj instanceof THREE.Mesh)) return;

//     const dataIndex = Math.floor(
//       (index / objects.length) * frequencyData.length
//     );
//     const frequencyValue = frequencyData[dataIndex] / 255;

//     // Scale animation
//     const scale = 1 + frequencyValue * params.intensity * 0.1;
//     obj.scale.set(scale, scale, scale);

//     // Rotation animation
//     obj.rotation.x = time * params.speed * 0.01;
//     obj.rotation.y = time * params.speed * 0.008;
//     obj.rotation.z = time * params.speed * 0.006;

//     // Position animation
//     if (obj.userData.basePosition) {
//       const basePos = obj.userData.basePosition as THREE.Vector3;
//       obj.position.x = basePos.x + Math.sin(time * 0.5 + index) * 0.5;
//       obj.position.y = basePos.y + Math.cos(time * 0.3 + index) * 0.5;
//     }

//     // Color animation
//     if (obj.material instanceof THREE.MeshPhongMaterial) {
//       const hue = (time * 0.05 + index * 0.1) % 1;
//       obj.material.color.setHSL(hue, 0.8, 0.6);
//     }
//   });
// };

// const animateWaveform3D = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams
// ): void => {
//   objects.forEach((obj) => {
//     if (!(obj instanceof THREE.Line) || obj.userData.type !== "waveform3D")
//       return;

//     const geometry = obj.geometry as THREE.BufferGeometry;
//     const positions = geometry.attributes.position.array as Float32Array;
//     const originalPositions = obj.userData.originalPositions as Float32Array;
//     const points = obj.userData.points;

//     for (let i = 0; i < points; i++) {
//       const i3 = i * 3;
//       const dataIndex = Math.floor((i / points) * frequencyData.length);
//       const frequencyValue = frequencyData[dataIndex] / 255;

//       // Create 3D waveform
//       positions[i3 + 1] = Math.sin(time * 2 + i * 0.1) * frequencyValue * 3;
//       positions[i3 + 2] = Math.cos(time * 2 + i * 0.1) * frequencyValue * 2;
//     }

//     geometry.attributes.position.needsUpdate = true;
//   });
// };

// const animateAudioReactive = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo: any
// ): void => {
//   objects.forEach((obj) => {
//     if (!(obj instanceof THREE.Mesh) || obj.userData.ring === undefined) return;

//     const ring = obj.userData.ring;
//     const segments = obj.userData.segments;
//     const bassLevel = beatInfo.bandStrengths.bass;

//     // React to different frequency bands
//     const scale = 1 + beatInfo.bandStrengths.mid * params.intensity * 0.01;
//     obj.scale.set(scale, scale, scale);

//     // Pulsate with bass
//     const pulse = 1 + Math.sin(time * 4 + ring) * bassLevel * 0.2;
//     obj.scale.multiplyScalar(pulse);

//     // Color shift with treble
//     if (obj.material instanceof THREE.MeshPhongMaterial) {
//       const hue =
//         (time * 0.1 + ring * 0.1 + beatInfo.bandStrengths.treble * 0.5) % 1;
//       obj.material.color.setHSL(hue, 0.8, 0.6);
//     }

//     // Deform geometry with audio
//     const geometry = obj.geometry as THREE.TorusGeometry;
//     const positions = geometry.attributes.position.array as Float32Array;

//     for (let i = 0; i < segments; i++) {
//       const dataIndex = Math.floor((i / segments) * frequencyData.length);
//       const frequencyValue = frequencyData[dataIndex] / 255;

//       // Modify vertex positions based on audio
//       const vertexIndex = i * 3;
//       if (positions[vertexIndex + 1] !== undefined) {
//         const wave = Math.sin(time * 2 + i * 0.5) * frequencyValue * 0.1;
//         positions[vertexIndex + 1] += wave;
//       }
//     }

//     geometry.attributes.position.needsUpdate = true;
//   });
// };

// const animateMorphing = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo: any
// ): void => {
//   objects.forEach((obj, index) => {
//     if (!(obj instanceof THREE.Mesh)) return;

//     const dataIndex = Math.floor(
//       (index / objects.length) * frequencyData.length
//     );
//     const frequencyValue = frequencyData[dataIndex] / 255;
//     const bassLevel = beatInfo.bandStrengths.bass;

//     // Morph geometry
//     const geometry = obj.geometry as THREE.BufferGeometry;
//     const positions = geometry.attributes.position.array as Float32Array;
//     const originalVertices = obj.userData.originalVertices as Float32Array;

//     for (let i = 0; i < positions.length; i += 3) {
//       const wave1 =
//         Math.sin(time * obj.userData.morphSpeed * 0.01 + i * 0.1) *
//         frequencyValue *
//         0.5;
//       const wave2 =
//         Math.cos(time * obj.userData.morphSpeed * 0.008 + i * 0.05) *
//         bassLevel *
//         0.3;

//       positions[i] = originalVertices[i] + wave1;
//       positions[i + 1] = originalVertices[i + 1] + wave2;
//       positions[i + 2] = originalVertices[i + 2] + (wave1 + wave2) * 0.5;
//     }

//     geometry.attributes.position.needsUpdate = true;

//     // Scale with beat
//     const beatScale = 1 + (beatInfo.isBeat ? 0.3 : 0);
//     obj.scale.setScalar(obj.userData.baseScale * beatScale);

//     // Color animation
//     if (obj.material instanceof THREE.MeshPhongMaterial) {
//       const hue = (time * 0.05 + index * 0.02) % 1;
//       obj.material.color.setHSL(hue, 0.9, 0.6);
//     }
//   });
// };

// const animateLiquid = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo: any
// ): void => {
//   objects.forEach((obj) => {
//     if (obj.userData.type === "liquid") {
//       // Animate liquid surface
//       const geometry = obj.geometry as THREE.PlaneGeometry;
//       const positions = geometry.attributes.position.array as Float32Array;
//       const originalVertices = obj.userData.originalVertices as Float32Array;
//       const resolution = obj.userData.resolution;

//       for (let i = 0; i < positions.length; i += 3) {
//         const vertexIndex = i / 3;
//         const x = originalVertices[i];
//         const z = originalVertices[i + 2];

//         let waveHeight = 0;

//         // Multiple wave sources
//         obj.userData.waveCenters.forEach((center: any) => {
//           const distance = Math.sqrt((x - center.x) ** 2 + (z - center.y) ** 2);
//           waveHeight += Math.sin(distance * 2 - (time + center.time) * 3) * 0.5;
//         });

//         // Audio reactivity
//         const dataIndex = Math.floor(
//           (vertexIndex / positions.length) * frequencyData.length
//         );
//         const audioInfluence =
//           (frequencyData[dataIndex] / 255) * params.fluidity * 0.01;

//         positions[i + 1] =
//           originalVertices[i + 1] + waveHeight * 0.5 + audioInfluence * 2;
//       }

//       geometry.attributes.position.needsUpdate = true;
//     } else if (obj.userData.type === "liquidParticles") {
//       // Animate floating particles
//       const geometry = obj.geometry as THREE.BufferGeometry;
//       const positions = geometry.attributes.position.array as Float32Array;

//       for (let i = 0; i < positions.length; i += 3) {
//         // Floating motion
//         positions[i + 1] += Math.sin(time + i * 0.01) * 0.01;

//         // Reset if too high
//         if (positions[i + 1] > 2) {
//           positions[i + 1] = 0;
//         }
//       }

//       geometry.attributes.position.needsUpdate = true;
//     }
//   });
// };

// const animateCyberGrid = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo: any
// ): void => {
//   objects.forEach((obj) => {
//     if (obj.userData.type === "cyberGrid") {
//       // Grid animation
//       const geometry = obj.geometry as THREE.BufferGeometry;
//       const positions = geometry.attributes.position.array as Float32Array;

//       for (let i = 0; i < positions.length; i += 3) {
//         // Pulsing grid lines
//         const pulse = Math.sin(time * 2 + positions[i] * 0.1) * 0.1;
//         positions[i + 1] += pulse;
//       }

//       geometry.attributes.position.needsUpdate = true;
//     } else {
//       // Node animation
//       const basePosition = obj.userData.basePosition as THREE.Vector3;
//       const speed = obj.userData.speed;

//       // Floating motion
//       obj.position.y = basePosition.y + Math.sin(time * speed) * 0.5;
//       obj.position.x = basePosition.x + Math.cos(time * speed * 0.7) * 0.3;

//       // Scale with audio
//       const dataIndex = Math.floor(
//         (obj.userData.index / objects.length) * frequencyData.length
//       );
//       const scale = 1 + (frequencyData[dataIndex] / 255) * 0.5;
//       obj.scale.set(scale, scale, scale);
//     }
//   });
// };

// const animateBiomorphic = (
//   objects: THREE.Object3D[],
//   frequencyData: Uint8Array,
//   time: number,
//   params: VisualizerParams,
//   beatInfo: any
// ): void => {
//   objects.forEach((obj) => {
//     // Recursive animation for biomorphic structures
//     obj.traverse((child) => {
//       if (child instanceof THREE.Mesh && child.userData.depth !== undefined) {
//         const depth = child.userData.depth;
//         const pulsePhase = child.userData.pulsePhase;

//         // Pulsing animation
//         const pulse = Math.sin(time * 2 + pulsePhase) * 0.1 + 1;
//         child.scale.y = pulse;

//         // Color animation based on depth and audio
//         if (child.material instanceof THREE.MeshPhongMaterial) {
//           const dataIndex = Math.floor((depth / 5) * frequencyData.length);
//           const audioInfluence = frequencyData[dataIndex] / 255;
//           const hue = (0.3 + depth * 0.1 + audioInfluence * 0.2) % 1;
//           child.material.color.setHSL(hue, 0.8, 0.5);
//         }

//         // Gentle rotation
//         child.rotation.z = Math.sin(time * 0.5 + depth) * 0.1;
//       }
//     });
//   });
// };

// // Enhanced Visualizer Manager
// class VisualizerManager {
//   createVisualizer(
//     scene: THREE.Scene,
//     params: VisualizerParams
//   ): THREE.Object3D[] {
//     switch (params.visualizerType) {
//       case "spectrum":
//         return createSpectrumVisualizer(scene, params);
//       case "particleWave":
//         return createParticleWaveVisualizer(scene, params);
//       case "geometric":
//         return createGeometricVisualizer(scene, params);
//       case "waveform3D":
//         return createWaveform3DVisualizer(scene, params);
//       case "audioReactive":
//         return createAudioReactiveVisualizer(scene, params);
//       case "morphing":
//         return createMorphingVisualizer(scene, params);
//       case "liquid":
//         return createLiquidVisualizer(scene, params);
//       case "cyberGrid":
//         return createCyberGridVisualizer(scene, params);
//       case "biomorphic":
//         return createBiomorphicVisualizer(scene, params);
//       default:
//         return createGeometricVisualizer(scene, params);
//     }
//   }

//   animateVisualizer(
//     objects: THREE.Object3D[],
//     frequencyData: Uint8Array,
//     time: number,
//     params: VisualizerParams,
//     beatInfo: any
//   ) {
//     switch (params.visualizerType) {
//       case "spectrum":
//         animateSpectrum(objects, frequencyData, time, params);
//         break;
//       case "particleWave":
//         animateParticleWave(objects, frequencyData, time, params);
//         break;
//       case "geometric":
//         animateGeometric(objects, frequencyData, time, params);
//         break;
//       case "waveform3D":
//         animateWaveform3D(objects, frequencyData, time, params);
//         break;
//       case "audioReactive":
//         animateAudioReactive(objects, frequencyData, time, params, beatInfo);
//         break;
//       case "morphing":
//         animateMorphing(objects, frequencyData, time, params, beatInfo);
//         break;
//       case "liquid":
//         animateLiquid(objects, frequencyData, time, params, beatInfo);
//         break;
//       case "cyberGrid":
//         animateCyberGrid(objects, frequencyData, time, params, beatInfo);
//         break;
//       case "biomorphic":
//         animateBiomorphic(objects, frequencyData, time, params, beatInfo);
//         break;
//       default:
//         animateGeometric(objects, frequencyData, time, params);
//     }
//   }
// }

// export const LivePreviewCanvas: React.FC = () => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [audioLevel, setAudioLevel] = useState(0);
//   const [beatDetected, setBeatDetected] = useState(false);
//   const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
//   const [audioName, setAudioName] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [audioError, setAudioError] = useState<string>("");
//   const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const [params, setParams] = useState<VisualizerParams>({
//     visualizerType: "audioReactive",
//     colorScheme: "cyberpunk",
//     intensity: 75,
//     speed: 50,
//     rotationSpeed: 25,
//     particleCount: 3000,
//     bloom: true,
//     wireframe: false,
//     mirrorEffect: true,
//     complexity: 6,
//     scale: 1.0,
//     bassBoost: false,
//     reverb: false,
//     frequencyRange: [20, 20000],
//     smoothing: 0.8,
//     beatDetection: true,
//     patternDensity: 5,
//     objectSize: 1.0,
//     morphSpeed: 50,
//     fluidity: 50,
//     glowIntensity: 50,
//     reactionSpeed: 50,
//   });

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const sceneRef = useRef<THREE.Scene | null>(null);
//   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
//   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//   const visualizerManagerRef = useRef<VisualizerManager>(
//     new VisualizerManager()
//   );
//   const audioManagerRef = useRef<AudioManager>(new AudioManager());
//   const animationIdRef = useRef<number>(0);
//   const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
//   const beatInfoRef = useRef<any>({
//     isBeat: false,
//     strength: 0,
//     bandStrengths: {},
//   });
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // Initialize Three.js
//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x0a0a0a);

//     const camera = new THREE.PerspectiveCamera(
//       75,
//       canvasRef.current.clientWidth / canvasRef.current.clientHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 0, 20);

//     const renderer = new THREE.WebGLRenderer({
//       canvas: canvasRef.current,
//       antialias: true,
//       alpha: true,
//     });

//     renderer.setSize(
//       canvasRef.current.clientWidth,
//       canvasRef.current.clientHeight
//     );
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     // Enhanced Lighting
//     const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//     directionalLight.position.set(5, 5, 5);
//     scene.add(directionalLight);

//     // Add point lights for better 3D effect
//     const pointLight1 = new THREE.PointLight(0xff00ff, 0.5, 100);
//     pointLight1.position.set(10, 10, 10);
//     scene.add(pointLight1);

//     const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 100);
//     pointLight2.position.set(-10, -10, -10);
//     scene.add(pointLight2);

//     sceneRef.current = scene;
//     cameraRef.current = camera;
//     rendererRef.current = renderer;

//     createVisualizer();

//     const handleResize = () => {
//       if (!canvasRef.current || !cameraRef.current || !rendererRef.current)
//         return;
//       cameraRef.current.aspect =
//         canvasRef.current.clientWidth / canvasRef.current.clientHeight;
//       cameraRef.current.updateProjectionMatrix();
//       rendererRef.current.setSize(
//         canvasRef.current.clientWidth,
//         canvasRef.current.clientHeight
//       );
//     };

//     window.addEventListener("resize", handleResize);

//     // Load default audio on component mount
//     const loadDefaultAudio = async () => {
//       try {
//         await audioManagerRef.current.initialize();
//         const success = await audioManagerRef.current.loadDefaultAudio();
//         if (success) {
//           setHasDefaultAudio(true);
//           console.log("Default audio loaded successfully");
//         }
//       } catch (error) {
//         console.error("Failed to load default audio:", error);
//       }
//     };

//     loadDefaultAudio();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//       audioManagerRef.current.cleanup();
//     };
//   }, []);

//   // Set up progress tracking
//   useEffect(() => {
//     const manager = audioManagerRef.current;
    
//     const handleProgressUpdate = (currentTime: number, totalDuration: number) => {
//       setProgress((currentTime / totalDuration) * 100);
//       setDuration(totalDuration);
      
//       // Update playing state based on audio progress
//       const playing = manager.isPlaying();
//       if (playing !== isPlaying) {
//         setIsPlaying(playing);
//       }
//     };

//     manager.onTimeUpdate(handleProgressUpdate);

//     return () => {
//       manager.offTimeUpdate(handleProgressUpdate);
//     };
//   }, [isPlaying]);

//   const createVisualizer = () => {
//     if (!sceneRef.current) return;

//     // Clear existing objects
//     visualizerObjectsRef.current.forEach((obj) => {
//       if (sceneRef.current) {
//         sceneRef.current.remove(obj);
//       }
//     });
//     visualizerObjectsRef.current = [];

//     // Create new visualizer
//     const objects = visualizerManagerRef.current.createVisualizer(
//       sceneRef.current,
//       params
//     );
//     visualizerObjectsRef.current = objects;
//   };

//   // Enhanced animation loop with audio analysis
//   useEffect(() => {
//     if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

//     const animate = () => {
//       animationIdRef.current = requestAnimationFrame(animate);

//       const frequencyData = audioManagerRef.current.getFrequencyData();
//       const time = Date.now() * 0.001;

//       // Enhanced beat detection with frequency analysis
//       const beatInfo = audioManagerRef.current.detectBeat(frequencyData);
//       beatInfoRef.current = beatInfo;

//       // Calculate audio level
//       const rms =
//         Math.sqrt(
//           frequencyData.reduce((sum, value) => sum + value * value, 0) /
//             frequencyData.length
//         ) / 255;
//       setAudioLevel(rms * 100);

//       if (params.beatDetection && beatInfo.isBeat) {
//         setBeatDetected(true);
//         setTimeout(() => setBeatDetected(false), 100);
//       }

//       // Animate visualizer with beat info
//       visualizerManagerRef.current.animateVisualizer(
//         visualizerObjectsRef.current,
//         frequencyData,
//         time,
//         params,
//         beatInfo
//       );

//       // Dynamic camera movement based on audio
//       if (cameraRef.current && params.rotationSpeed > 0) {
//         const bass = beatInfo.bandStrengths.bass;
//         const cameraDistance = 15 + bass * 5;
//         const cameraSpeed = params.rotationSpeed * 0.005 + bass * 0.01;

//         cameraRef.current.position.x =
//           Math.sin(time * cameraSpeed) * cameraDistance;
//         cameraRef.current.position.z =
//           Math.cos(time * cameraSpeed) * cameraDistance;
//         cameraRef.current.position.y = Math.sin(time * cameraSpeed * 0.7) * 3;
//         cameraRef.current.lookAt(0, 0, 0);
//       }

//       // Safe render
//       if (sceneRef.current && cameraRef.current && rendererRef.current) {
//         rendererRef.current.render(sceneRef.current, cameraRef.current);
//       }
//     };

//     animate();

//     return () => {
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//     };
//   }, [isPlaying, params]);

//   const togglePlayback = async () => {
//     const manager = audioManagerRef.current;
//     if (!manager) return;

//     try {
//       if (manager.isPlaying()) {
//         manager.pause();
//         setIsPlaying(false);
//       } else {
//         await manager.play();
//         setIsPlaying(true);
//         setAudioError("");
//       }
//     } catch (error) {
//       console.error("Playback error:", error);
//       setAudioError("Failed to play audio");
//     }
//   };

//   // Update visualizer when params change
//   useEffect(() => {
//     createVisualizer();
//   }, [
//     params.visualizerType,
//     params.complexity,
//     params.wireframe,
//     params.objectSize,
//     params.particleCount,
//   ]);

//   const handleAudioUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     console.log("🎵 Upload triggered for:", file.name);

//     if (!file.type.startsWith("audio/")) {
//       setAudioError("Please select a valid audio file");
//       return;
//     }

//     setIsLoading(true);
//     setAudioError("");

//     try {
//       if (!audioManagerRef.current) {
//         audioManagerRef.current = new AudioManager();
//       }

//       await audioManagerRef.current.initialize();

//       const success = await audioManagerRef.current.loadAudioFile(file);
//       if (success) {
//         setUploadedAudio(file);
//         setAudioName(file.name);
//         setHasDefaultAudio(false);
//         console.log("✅ File loaded successfully:", file.name);
//       } else {
//         throw new Error("Failed to load audio file");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       setAudioError("Error uploading audio file");
//     } finally {
//       setIsLoading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const handleClearAudio = () => {
//     setUploadedAudio(null);
//     setAudioName("");
//     setAudioError("");
//     audioManagerRef.current.cleanup();
//     setIsPlaying(false);

//     // Reinitialize audio manager and load default audio
//     audioManagerRef.current = new AudioManager();
//     const loadDefault = async () => {
//       await audioManagerRef.current.initialize();
//       await audioManagerRef.current.loadDefaultAudio();
//       setHasDefaultAudio(true);
//     };
//     loadDefault();
//   };

//   const handleDemoAudio = async () => {
//     try {
//       if (!hasDefaultAudio) {
//         await audioManagerRef.current.loadDefaultAudio();
//         setHasDefaultAudio(true);
//       }
//       setUploadedAudio(null);
//       setAudioName("Default Demo Audio");
//       setAudioError("");
//       console.log("Demo audio ready");
//     } catch (error) {
//       console.error("Demo audio failed:", error);
//       setAudioError("Failed to load demo audio");
//     }
//   };

//   const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!audioManagerRef.current) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const clickX = e.clientX - rect.left;
//     const newTime = (clickX / rect.width) * duration;
//     audioManagerRef.current.seekTo(newTime);
//   };

//   const canPlayAudio = uploadedAudio || hasDefaultAudio;

//   return (
//     <div className="h-full flex flex-col bg-slate-900/50">
//       <div className="flex-1 relative group">
//         <canvas ref={canvasRef} className="w-full h-full" />

//         {beatDetected && (
//           <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
//         )}

//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

//         {/* Enhanced Controls */}
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
//           {/* Audio Upload */}
//           <div className="flex items-center gap-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="audio/*"
//               onChange={handleAudioUpload}
//               className="hidden"
//               id="audio-upload"
//             />
//             <label htmlFor="audio-upload" className="cursor-pointer">
//               <Button
//                 onClick={() => {
//                   console.log("✅ Upload button clicked");
//                   if (!fileInputRef.current) {
//                     console.error("❌ fileInputRef is null");
//                     return;
//                   }
//                   fileInputRef.current.click();
//                 }}
//                 variant="secondary"
//                 size="sm"
//                 icon={<Upload size={16} />}
//                 className="px-4"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Loading..." : "Upload"}
//               </Button>
//             </label>
//             {(audioName || hasDefaultAudio) && (
//               <div className="flex items-center gap-2">
//                 <Music size={14} className="text-slate-300" />
//                 <span className="text-sm text-slate-300 max-w-32 truncate">
//                   {audioName || "Default Audio"}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   icon={<Trash2 size={14} />}
//                   onClick={handleClearAudio}
//                   className="p-1 hover:bg-slate-700/50"
//                 />
//               </div>
//             )}
//           </div>

//           <Button
//             variant="secondary"
//             size="lg"
//             icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             onClick={togglePlayback}
//             className="px-6"
//             disabled={!canPlayAudio || isLoading}
//           >
//             {isPlaying ? "Pause" : "Play"}
//           </Button>

//           <select
//             value={params.visualizerType}
//             onChange={(e) =>
//               setParams((p) => ({
//                 ...p,
//                 visualizerType: e.target
//                   .value as VisualizerParams["visualizerType"],
//               }))
//             }
//             className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
//           >
//             <option value="audioReactive">Audio Reactive</option>
//             <option value="morphing">Morphing Shapes</option>
//             <option value="liquid">Liquid Motion</option>
//             <option value="cyberGrid">Cyber Grid</option>
//             <option value="biomorphic">Biomorphic</option>
//             <option value="particleWave">Particle Wave</option>
//             <option value="geometric">Geometric</option>
//             <option value="waveform3D">3D Waveform</option>
//             <option value="spectrum">Spectrum</option>
//           </select>

//           {/* Enhanced Audio Level Meter with frequency bands */}
//           <div className="flex items-center gap-2">
//             <Volume2 size={16} className="text-slate-300" />
//             <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-100"
//                 style={{ width: `${audioLevel}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="absolute bottom-20 left-4 right-4">
//           <div
//             className="w-full h-2 bg-gray-700 rounded cursor-pointer relative"
//             onClick={handleSeek}
//           >
//             <div
//               className="bg-green-500 h-2 rounded transition-all duration-100"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <div className="flex justify-between text-xs text-gray-400 mt-1">
//             <span>{Math.floor((progress / 100) * duration)}s</span>
//             <span>{Math.floor(duration)}s</span>
//           </div>
//         </div>

//         {/* Error Message */}
//         {audioError && (
//           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
//             {audioError}
//           </div>
//         )}

//         {/* Enhanced Visualizer Info */}
//         <div className="absolute bottom-32 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
//             <span className="text-sm text-slate-300 capitalize">
//               {params.visualizerType} Visualizer
//             </span>
//             {beatInfoRef.current.isBeat && (
//               <span className="ml-2 text-xs text-red-400 animate-pulse">
//                 BEAT!
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Upload Hint */}
//         {!uploadedAudio && !hasDefaultAudio && (
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
//             <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
//               <Upload size={48} className="mx-auto mb-4 text-slate-400" />
//               <h3 className="text-lg font-semibold text-white mb-2">
//                 Upload Audio to Visualize
//               </h3>
//               <p className="text-slate-300 mb-4">
//                 Upload an MP3, WAV, or other audio file to see it come to life
//                 with dynamic visualizations.
//               </p>
//               <label htmlFor="audio-upload">
//                 <Button
//                   variant="primary"
//                   size="lg"
//                   icon={<Upload size={20} />}
//                   className="w-full"
//                 >
//                   Choose Audio File
//                 </Button>
//               </label>
//               <div className="mt-4">
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   icon={<Wand2 size={16} />}
//                   onClick={handleDemoAudio}
//                   className="w-full"
//                 >
//                   Try Demo Audio
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Enhanced Control Panel */}
//       <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-6 space-y-6">
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//           <Slider
//             label="Intensity"
//             value={params.intensity}
//             onChange={(v: any) => setParams((p) => ({ ...p, intensity: v }))}
//           />
//           <Slider
//             label="Speed"
//             value={params.speed}
//             onChange={(v: any) => setParams((p) => ({ ...p, speed: v }))}
//           />
//           <Slider
//             label="Rotation"
//             value={params.rotationSpeed}
//             onChange={(v: any) =>
//               setParams((p) => ({ ...p, rotationSpeed: v }))
//             }
//           />
//           <Slider
//             label="Complexity"
//             value={params.complexity}
//             min={1}
//             max={10}
//             onChange={(v: any) => setParams((p) => ({ ...p, complexity: v }))}
//           />
//           <Slider
//             label="Particles"
//             value={params.particleCount}
//             min={100}
//             max={10000}
//             step={100}
//             onChange={(v: any) =>
//               setParams((p) => ({ ...p, particleCount: v }))
//             }
//           />
//           <Slider
//             label="Morph Speed"
//             value={params.morphSpeed}
//             onChange={(v: any) => setParams((p) => ({ ...p, morphSpeed: v }))}
//           />
//           <Slider
//             label="Fluidity"
//             value={params.fluidity}
//             onChange={(v: any) => setParams((p) => ({ ...p, fluidity: v }))}
//           />
//           <Slider
//             label="Reaction Speed"
//             value={params.reactionSpeed}
//             onChange={(v: any) =>
//               setParams((p) => ({ ...p, reactionSpeed: v }))
//             }
//           />
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-6">
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.wireframe}
//                 onChange={(e) =>
//                   setParams((p) => ({ ...p, wireframe: e.target.checked }))
//                 }
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Wireframe</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.beatDetection}
//                 onChange={(e) =>
//                   setParams((p) => ({ ...p, beatDetection: e.target.checked }))
//                 }
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Beat Detection</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.mirrorEffect}
//                 onChange={(e) =>
//                   setParams((p) => ({ ...p, mirrorEffect: e.target.checked }))
//                 }
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Mirror Effect</span>
//             </label>
//           </div>

//           <div className="flex gap-3">
//             <Button
//               variant="secondary"
//               size="sm"
//               icon={<Wand2 size={16} />}
//               onClick={handleDemoAudio}
//             >
//               Demo
//             </Button>
//             <Button variant="primary" size="sm" icon={<Download size={16} />}>
//               Export
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };