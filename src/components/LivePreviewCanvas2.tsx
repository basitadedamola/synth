import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Square,
  Download,
  Wand2,
  Trash2,
  Volume2,
  Settings,
  Sparkles,
  Upload,
  Music,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Slider } from "./ui/Slider";
import * as THREE from 'three';

// Types
interface VisualizerParams {
  visualizerType: "spectrum" | "particleWave" | "orbital" | "tunnel" | "nebula" | "crystal" | "geometric" | "waveform3D" | "fractal";
  colorScheme: "cyberpunk" | "ocean" | "sunset" | "forest" | "neon" | "monochrome" | "rainbow";
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
}

// Simple Audio Manager
class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: OscillatorNode | null = null;

  async setupAudio() {
    this.cleanup();

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.source = this.audioContext.createOscillator();
      this.source.type = 'sawtooth';
      this.source.frequency.value = 110;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.1;
      
      this.source.connect(gainNode);
      gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      this.source.start();

    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(1024);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  cleanup() {
    if (this.source) {
      this.source.stop();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Visualizer implementations
const createSpectrumVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const bars = 128;

  for (let i = 0; i < bars; i++) {
    const geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i / bars) * 0.8, 0.9, 0.6),
    });
    
    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = (i - bars / 2) * 0.15;
    bar.position.y = 0.5;
    bar.userData = { index: i };
    
    scene.add(bar);
    objects.push(bar);
  }
  
  return objects;
};

const createParticleWaveVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const particles = Math.min(params.particleCount, 10000);
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const colors = new Float32Array(particles * 3);
  const sizes = new Float32Array(particles);

  for (let i = 0; i < particles; i++) {
    const i3 = i * 3;
    const angle = (i / particles) * Math.PI * 2;
    const radius = 5 + Math.random() * 3;
    
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = (Math.random() - 0.5) * 4;
    positions[i3 + 2] = Math.sin(angle) * radius;

    const hue = (i / particles) * 0.8;
    const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 0.1 + 0.05;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const particleSystem = new THREE.Points(geometry, material);
  particleSystem.userData = {
    type: 'particleWave',
    particleCount: particles,
    basePositions: positions.slice()
  };

  scene.add(particleSystem);
  objects.push(particleSystem);

  return objects;
};

const createGeometricVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const count = Math.floor(params.complexity * 3);
  
  for (let i = 0; i < count; i++) {
    const size = 0.3 + Math.random() * params.objectSize;
    const geometry = new THREE.OctahedronGeometry(size);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i / count) * 0.8, 0.9, 0.6),
      wireframe: params.wireframe,
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    const angle = (i / count) * Math.PI * 2;
    const radius = 2 + (i % 4);
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * 0.5,
      Math.sin(angle) * radius
    );
    
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    mesh.userData = {
      index: i,
      baseScale: 1,
      rotationSpeed: 0.001 + Math.random() * 0.002
    };

    scene.add(mesh);
    objects.push(mesh);
  }

  return objects;
};

const createWaveform3DVisualizer = (scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] => {
  const objects: THREE.Object3D[] = [];
  const layers = 3;
  const pointsPerLayer = 128;
  
  for (let layer = 0; layer < layers; layer++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsPerLayer * 3);
    
    for (let i = 0; i < pointsPerLayer; i++) {
      const i3 = i * 3;
      const x = (i - pointsPerLayer / 2) * 0.1;
      positions[i3] = x;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = layer * 2 - (layers - 1);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(layer / layers, 0.8, 0.6),
      linewidth: 2
    });
    
    const waveform = new THREE.Line(geometry, material);
    waveform.userData = { layer, points: pointsPerLayer };
    
    scene.add(waveform);
    objects.push(waveform);
  }
  
  return objects;
};

// Animation functions
const animateSpectrum = (objects: THREE.Object3D[], frequencyData: Uint8Array, time: number, params: VisualizerParams): void => {
  objects.forEach((bar, i) => {
    if (!(bar instanceof THREE.Mesh)) return;

    const dataIndex = Math.floor((i / objects.length) * frequencyData.length);
    const frequencyValue = frequencyData[dataIndex] / 255;
    
    const height = 1 + frequencyValue * params.intensity * 0.1;
    bar.scale.y = Math.max(0.1, height);
    bar.position.y = height / 2;

    if (bar.material instanceof THREE.MeshPhongMaterial) {
      const hue = (time * 0.1 + i * 0.01) % 1;
      bar.material.color.setHSL(hue, 0.8, 0.6);
    }
  });
};

const animateParticleWave = (objects: THREE.Object3D[], frequencyData: Uint8Array, time: number, params: VisualizerParams): void => {
  objects.forEach((obj) => {
    if (!(obj instanceof THREE.Points)) return;
    
    const positions = obj.geometry.attributes.position.array as Float32Array;
    const colors = obj.geometry.attributes.color.array as Float32Array;
    const basePositions = obj.userData.basePositions as Float32Array;
    const particleCount = obj.userData.particleCount;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / particleCount) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;
      
      const baseX = basePositions[i3];
      const baseZ = basePositions[i3 + 2];
      const angle = Math.atan2(baseZ, baseX);
      const baseRadius = Math.sqrt(baseX * baseX + baseZ * baseZ);
      
      const waveIntensity = frequencyValue * params.intensity * 0.1;
      const wave = Math.sin(time * params.speed * 0.01 + i * 0.05) * waveIntensity;
      const newRadius = baseRadius + wave;
      
      positions[i3] = Math.cos(angle) * newRadius;
      positions[i3 + 2] = Math.sin(angle) * newRadius;
      positions[i3 + 1] = basePositions[i3 + 1] + (frequencyValue - 0.5) * params.intensity * 0.2;
      
      const hue = (time * 0.1 + i * 0.001) % 1;
      const color = new THREE.Color().setHSL(hue, 0.7 + frequencyValue * 0.3, 0.5 + frequencyValue * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    obj.geometry.attributes.position.needsUpdate = true;
    obj.geometry.attributes.color.needsUpdate = true;
  });
};

const animateGeometric = (objects: THREE.Object3D[], frequencyData: Uint8Array, time: number, params: VisualizerParams): void => {
  objects.forEach((obj, i) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const dataIndex = Math.floor((i / objects.length) * frequencyData.length);
    const frequencyValue = frequencyData[dataIndex] / 255;
    
    const scale = 1 + frequencyValue * params.intensity * 0.02;
    obj.scale.set(scale, scale, scale);

    obj.rotation.x += (obj.userData.rotationSpeed || 0.001) * params.speed;
    obj.rotation.y += (obj.userData.rotationSpeed || 0.001) * params.speed * 1.3;

    if (obj.material instanceof THREE.MeshPhongMaterial) {
      const hue = (time * 0.05 + i * 0.02) % 1;
      obj.material.color.setHSL(hue, 0.8, 0.6);
    }
  });
};

const animateWaveform3D = (objects: THREE.Object3D[], frequencyData: Uint8Array, time: number, params: VisualizerParams): void => {
  objects.forEach((obj, layerIndex) => {
    if (!(obj instanceof THREE.Line)) return;
    
    const positions = obj.geometry.attributes.position.array as Float32Array;
    const layer = obj.userData.layer;
    
    for (let i = 0; i < obj.userData.points; i++) {
      const i3 = i * 3;
      const dataIndex = Math.floor((i / obj.userData.points) * frequencyData.length);
      const frequencyValue = frequencyData[dataIndex] / 255;
      
      const wave = Math.sin(time * params.speed * 0.01 + i * 0.2) * 0.5;
      positions[i3 + 1] = (frequencyValue - 0.5) * params.intensity * 0.1 + wave;
    }
    
    obj.geometry.attributes.position.needsUpdate = true;
  });
};

// Visualizer Manager
class VisualizerManager {
  createVisualizer(scene: THREE.Scene, params: VisualizerParams): THREE.Object3D[] {
    switch (params.visualizerType) {
      case "spectrum":
        return createSpectrumVisualizer(scene, params);
      case "particleWave":
        return createParticleWaveVisualizer(scene, params);
      case "geometric":
        return createGeometricVisualizer(scene, params);
      case "waveform3D":
        return createWaveform3DVisualizer(scene, params);
      default:
        return createGeometricVisualizer(scene, params);
    }
  }

  animateVisualizer(objects: THREE.Object3D[], frequencyData: Uint8Array, time: number, params: VisualizerParams) {
    switch (params.visualizerType) {
      case "spectrum":
        animateSpectrum(objects, frequencyData, time, params);
        break;
      case "particleWave":
        animateParticleWave(objects, frequencyData, time, params);
        break;
      case "geometric":
        animateGeometric(objects, frequencyData, time, params);
        break;
      case "waveform3D":
        animateWaveform3D(objects, frequencyData, time, params);
        break;
      default:
        animateGeometric(objects, frequencyData, time, params);
    }
  }
}

export const LivePreviewCanvas: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);

  const [params, setParams] = useState<VisualizerParams>({
    visualizerType: "particleWave", // Changed default to particleWave
    colorScheme: "cyberpunk",
    intensity: 75,
    speed: 50,
    rotationSpeed: 25,
    particleCount: 3000,
    bloom: true,
    wireframe: false,
    mirrorEffect: true,
    complexity: 6,
    scale: 1.0,
    bassBoost: false,
    reverb: false,
    frequencyRange: [20, 20000],
    smoothing: 0.8,
    beatDetection: true,
    patternDensity: 5,
    objectSize: 1.0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(new VisualizerManager());
  const audioManagerRef = useRef<AudioManager>(new AudioManager());
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const beatHistoryRef = useRef<number[]>([]);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    createVisualizer();

    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      audioManagerRef.current.cleanup();
    };
  }, []);

  const createVisualizer = () => {
    if (!sceneRef.current) return;

    // Clear existing objects
    visualizerObjectsRef.current.forEach(obj => {
      if (sceneRef.current) {
        sceneRef.current.remove(obj);
      }
    });
    visualizerObjectsRef.current = [];

    // Create new visualizer
    const objects = visualizerManagerRef.current.createVisualizer(sceneRef.current, params);
    visualizerObjectsRef.current = objects;
  };

  const detectBeat = (currentLevel: number) => {
    const history = beatHistoryRef.current;
    history.push(currentLevel);
    
    if (history.length > 60) {
      history.shift();
    }

    if (history.length > 10) {
      const average = history.reduce((a, b) => a + b) / history.length;
      const threshold = average * 1.3;
      
      if (currentLevel > threshold) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }
    }
  };

  // Animation loop with proper null checks
  useEffect(() => {
    if (!isPlaying || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const frequencyData = audioManagerRef.current.getFrequencyData();
      const time = Date.now() * 0.001;

      // Calculate audio level for beat detection
      const rms = Math.sqrt(frequencyData.reduce((sum, value) => sum + value * value, 0) / frequencyData.length) / 255;
      setAudioLevel(rms * 100);

      if (params.beatDetection) {
        detectBeat(rms);
      }

      // Animate visualizer
      visualizerManagerRef.current.animateVisualizer(
        visualizerObjectsRef.current,
        frequencyData,
        time,
        params
      );

      // Camera animation with null checks
      if (cameraRef.current && params.rotationSpeed > 0) {
        cameraRef.current.position.x = Math.sin(time * params.rotationSpeed * 0.005) * 20;
        cameraRef.current.position.z = Math.cos(time * params.rotationSpeed * 0.005) * 20;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Safe render with null checks
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, params]);

  // Update visualizer when params change
  useEffect(() => {
    createVisualizer();
  }, [params.visualizerType, params.complexity, params.wireframe, params.objectSize, params.particleCount]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioManagerRef.current.cleanup();
      setIsPlaying(false);
    } else {
      await audioManagerRef.current.setupAudio();
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      <div className="flex-1 relative group">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {beatDetected && (
          <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
          <Button
            variant="secondary"
            size="lg"
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            onClick={handlePlayPause}
            className="px-6"
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <select
            value={params.visualizerType}
            onChange={(e) => setParams(p => ({ ...p, visualizerType: e.target.value as VisualizerParams["visualizerType"] }))}
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="particleWave">Particle Wave</option>
            <option value="geometric">Geometric Patterns</option>
            <option value="waveform3D">3D Waveform</option>
            <option value="spectrum">Frequency Spectrum</option>
          </select>

          {/* Audio Level Meter */}
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-slate-300" />
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visualizer Type Badge */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
            <span className="text-sm text-slate-300 capitalize">
              {params.visualizerType} Visualizer
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Slider
            label="Intensity"
            value={params.intensity}
            onChange={(v: any) => setParams((p) => ({ ...p, intensity: v }))}
          />
          <Slider
            label="Speed"
            value={params.speed}
            onChange={(v: any) => setParams((p) => ({ ...p, speed: v }))}
          />
          <Slider
            label="Rotation"
            value={params.rotationSpeed}
            onChange={(v: any) => setParams((p) => ({ ...p, rotationSpeed: v }))}
          />
          <Slider
            label="Complexity"
            value={params.complexity}
            min={1}
            max={10}
            onChange={(v: any) => setParams((p) => ({ ...p, complexity: v }))}
          />
          <Slider
            label="Particles"
            value={params.particleCount}
            min={100}
            max={10000}
            step={100}
            onChange={(v: any) => setParams((p) => ({ ...p, particleCount: v }))}
          />
          <Slider
            label="Object Size"
            value={params.objectSize * 100}
            onChange={(v: any) => setParams((p) => ({ ...p, objectSize: v / 100 }))}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.wireframe}
                onChange={(e) => setParams((p) => ({ ...p, wireframe: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Wireframe</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.beatDetection}
                onChange={(e) => setParams((p) => ({ ...p, beatDetection: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Beat Detection</span>
            </label>
          </div>

          <Button variant="primary" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};