import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Download,
  Wand2,
  Trash2,
  Volume2,
  Upload,
  Music,
} from "lucide-react";
import { BeatInfo } from "../../studio/types/visualizer";
// import { Button } from "../../studio/components/Button";
// import { Slider } from "../../studio/components/Slider";

import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";
import * as THREE from "three";
import { VisualizerParams } from "../../studio/types/visualizer";
import { AudioManager } from "../../studio/audio/AudioManager";
import { VisualizerManager } from "../../studio/visualizers/manager/VisualizerManager";

export const LivePreviewCanvas: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string>("");
  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [params, setParams] = useState<VisualizerParams>({
    visualizerType: "audioReactive",
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
    objectSize: 1.0,
    morphSpeed: 50,
    fluidity: 50,
    glowIntensity: 50,
    reactionSpeed: 50,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visualizerManagerRef = useRef<VisualizerManager>(
    new VisualizerManager()
  );
  const audioManagerRef = useRef<AudioManager>(new AudioManager());
  const animationIdRef = useRef<number>(0);
  const visualizerObjectsRef = useRef<THREE.Object3D[]>([]);
  const beatInfoRef = useRef<BeatInfo>({
    isBeat: false,
    strength: 0,
    bandStrengths: {},
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights for better 3D effect
    const pointLight1 = new THREE.PointLight(0xff00ff, 0.5, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 100);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    createVisualizer();

    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current)
        return;
      cameraRef.current.aspect =
        canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Load default audio on component mount
    const loadDefaultAudio = async () => {
      try {
        await audioManagerRef.current.initialize();
        const success = await audioManagerRef.current.loadDefaultAudio();
        if (success) {
          setHasDefaultAudio(true);
          console.log("Default audio loaded successfully");
        }
      } catch (error) {
        console.error("Failed to load default audio:", error);
      }
    };

    loadDefaultAudio();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      audioManagerRef.current.cleanup();
    };
  }, []);

  // Set up progress tracking
  useEffect(() => {
    const manager = audioManagerRef.current;
    
    const handleProgressUpdate = (currentTime: number, totalDuration: number) => {
      setProgress((currentTime / totalDuration) * 100);
      setDuration(totalDuration);
      
      // Update playing state based on audio progress
      const playing = manager.isPlaying();
      if (playing !== isPlaying) {
        setIsPlaying(playing);
      }
    };

    manager.onTimeUpdate(handleProgressUpdate);

    return () => {
      manager.offTimeUpdate(handleProgressUpdate);
    };
  }, [isPlaying]);

  const createVisualizer = () => {
    if (!sceneRef.current) return;

    // Clear existing objects
    visualizerObjectsRef.current.forEach((obj) => {
      if (sceneRef.current) {
        sceneRef.current.remove(obj);
      }
    });
    visualizerObjectsRef.current = [];

    // Create new visualizer
    const objects = visualizerManagerRef.current.createVisualizer(
      sceneRef.current,
      params
    );
    visualizerObjectsRef.current = objects;
  };

  // Enhanced animation loop with audio analysis
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const frequencyData = audioManagerRef.current.getFrequencyData();
      const time = Date.now() * 0.001;

      // Enhanced beat detection with frequency analysis
      const beatInfo = audioManagerRef.current.detectBeat(frequencyData);
      beatInfoRef.current = beatInfo;

      // Calculate audio level
      const rms =
        Math.sqrt(
          frequencyData.reduce((sum, value) => sum + value * value, 0) /
            frequencyData.length
        ) / 255;
      setAudioLevel(rms * 100);

      if (params.beatDetection && beatInfo.isBeat) {
        setBeatDetected(true);
        setTimeout(() => setBeatDetected(false), 100);
      }

      // Animate visualizer with beat info
      visualizerManagerRef.current.animateVisualizer(
        visualizerObjectsRef.current,
        frequencyData,
        time,
        params,
        beatInfo
      );

      // Dynamic camera movement based on audio
      if (cameraRef.current && params.rotationSpeed > 0) {
        const bass = beatInfo.bandStrengths.bass;
        const cameraDistance = 15 + bass * 5;
        const cameraSpeed = params.rotationSpeed * 0.005 + bass * 0.01;

        cameraRef.current.position.x =
          Math.sin(time * cameraSpeed) * cameraDistance;
        cameraRef.current.position.z =
          Math.cos(time * cameraSpeed) * cameraDistance;
        cameraRef.current.position.y = Math.sin(time * cameraSpeed * 0.7) * 3;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Safe render
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

  const togglePlayback = async () => {
    const manager = audioManagerRef.current;
    if (!manager) return;

    try {
      if (manager.isPlaying()) {
        manager.pause();
        setIsPlaying(false);
      } else {
        await manager.play();
        setIsPlaying(true);
        setAudioError("");
      }
    } catch (error) {
      console.error("Playback error:", error);
      setAudioError("Failed to play audio");
    }
  };

  // Update visualizer when params change
  useEffect(() => {
    createVisualizer();
  }, [
    params.visualizerType,
    params.complexity,
    params.wireframe,
    params.objectSize,
    params.particleCount,
  ]);

  const handleAudioUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🎵 Upload triggered for:", file.name);

    if (!file.type.startsWith("audio/")) {
      setAudioError("Please select a valid audio file");
      return;
    }

    setIsLoading(true);
    setAudioError("");

    try {
      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioManager();
      }

      await audioManagerRef.current.initialize();

      const success = await audioManagerRef.current.loadAudioFile(file);
      if (success) {
        setUploadedAudio(file);
        setAudioName(file.name);
        setHasDefaultAudio(false);
        console.log("✅ File loaded successfully:", file.name);
      } else {
        throw new Error("Failed to load audio file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAudioError("Error uploading audio file");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearAudio = () => {
    setUploadedAudio(null);
    setAudioName("");
    setAudioError("");
    audioManagerRef.current.cleanup();
    setIsPlaying(false);

    // Reinitialize audio manager and load default audio
    audioManagerRef.current = new AudioManager();
    const loadDefault = async () => {
      await audioManagerRef.current.initialize();
      await audioManagerRef.current.loadDefaultAudio();
      setHasDefaultAudio(true);
    };
    loadDefault();
  };

  const handleDemoAudio = async () => {
    try {
      if (!hasDefaultAudio) {
        await audioManagerRef.current.loadDefaultAudio();
        setHasDefaultAudio(true);
      }
      setUploadedAudio(null);
      setAudioName("Default Demo Audio");
      setAudioError("");
      console.log("Demo audio ready");
    } catch (error) {
      console.error("Demo audio failed:", error);
      setAudioError("Failed to load demo audio");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioManagerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioManagerRef.current.seekTo(newTime);
  };

  const canPlayAudio = uploadedAudio || hasDefaultAudio;

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      <div className="flex-1 relative group">
        <canvas ref={canvasRef} className="w-full h-full" />

        {beatDetected && (
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Enhanced Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
          {/* Audio Upload */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Button
                onClick={() => {
                  console.log("✅ Upload button clicked");
                  if (!fileInputRef.current) {
                    console.error("❌ fileInputRef is null");
                    return;
                  }
                  fileInputRef.current.click();
                }}
                variant="secondary"
                size="sm"
                icon={<Upload size={16} />}
                className="px-4"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Upload"}
              </Button>
            </label>
            {(audioName || hasDefaultAudio) && (
              <div className="flex items-center gap-2">
                <Music size={14} className="text-slate-300" />
                <span className="text-sm text-slate-300 max-w-32 truncate">
                  {audioName || "Default Audio"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={handleClearAudio}
                  className="p-1 hover:bg-slate-700/50"
                />
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="lg"
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            onClick={togglePlayback}
            className="px-6"
            disabled={!canPlayAudio || isLoading}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <select
            value={params.visualizerType}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                visualizerType: e.target
                  .value as VisualizerParams["visualizerType"],
              }))
            }
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="audioReactive">Audio Reactive</option>
            <option value="morphing">Morphing Shapes</option>
            <option value="liquid">Liquid Motion</option>
            <option value="cyberGrid">Cyber Grid</option>
            <option value="biomorphic">Biomorphic</option>
            <option value="particleWave">Particle Wave</option>
            <option value="geometric">Geometric</option>
            <option value="waveform3D">3D Waveform</option>
            <option value="spectrum">Spectrum</option>
          </select>

          {/* Enhanced Audio Level Meter with frequency bands */}
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-slate-300" />
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-20 left-4 right-4">
          <div
            className="w-full h-2 bg-gray-700 rounded cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="bg-green-500 h-2 mb-12 rounded transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{Math.floor((progress / 100) * duration)}s</span>
            <span>{Math.floor(duration)}s</span>
          </div>
        </div>

        {/* Error Message */}
        {audioError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {audioError}
          </div>
        )}

        {/* Enhanced Visualizer Info */}
        <div className="absolute bottom-32 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
            <span className="text-sm text-slate-300 capitalize">
              {params.visualizerType} Visualizer
            </span>
            {beatInfoRef.current.isBeat && (
              <span className="ml-2 text-xs text-red-400 animate-pulse">
                BEAT!
              </span>
            )}
          </div>
        </div>

        {/* Upload Hint */}
        {!uploadedAudio && !hasDefaultAudio && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
              <Upload size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Upload Audio to Visualize
              </h3>
              <p className="text-slate-300 mb-4">
                Upload an MP3, WAV, or other audio file to see it come to life
                with dynamic visualizations.
              </p>
              <label htmlFor="audio-upload">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Upload size={20} />}
                  className="w-full"
                >
                  Choose Audio File
                </Button>
              </label>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Wand2 size={16} />}
                  onClick={handleDemoAudio}
                  className="w-full"
                >
                  Try Demo Audio
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Control Panel */}
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
            onChange={(v: any) =>
              setParams((p) => ({ ...p, rotationSpeed: v }))
            }
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
            onChange={(v: any) =>
              setParams((p) => ({ ...p, particleCount: v }))
            }
          />
          <Slider
            label="Morph Speed"
            value={params.morphSpeed}
            onChange={(v: any) => setParams((p) => ({ ...p, morphSpeed: v }))}
          />
          <Slider
            label="Fluidity"
            value={params.fluidity}
            onChange={(v: any) => setParams((p) => ({ ...p, fluidity: v }))}
          />
          <Slider
            label="Reaction Speed"
            value={params.reactionSpeed}
            onChange={(v: any) =>
              setParams((p) => ({ ...p, reactionSpeed: v }))
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.wireframe}
                onChange={(e) =>
                  setParams((p) => ({ ...p, wireframe: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Wireframe</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.beatDetection}
                onChange={(e) =>
                  setParams((p) => ({ ...p, beatDetection: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Beat Detection</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={params.mirrorEffect}
                onChange={(e) =>
                  setParams((p) => ({ ...p, mirrorEffect: e.target.checked }))
                }
                className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
              />
              <span>Mirror Effect</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<Wand2 size={16} />}
              onClick={handleDemoAudio}
            >
              Demo
            </Button>
            <Button variant="primary" size="sm" icon={<Download size={16} />}>
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};