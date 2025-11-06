// import { useState, useEffect, useRef } from "react";
// import { Play, Pause, Maximize2, Square, Download, Wand2, Trash2, Volume2, Settings, Sparkles, Upload, Music } from "lucide-react";
// import { Button } from "./ui/Button";
// import { Slider } from "./ui/Slider";
// import { AdvancedAIVisualizerGenerator } from "./visualizers/AIGenerator";
// import { AudioService } from "./visualizers/AudioService";
// import { VisualizerEngine } from "./visualizers/VisualizerEngine";
// import { BeatDetectionService } from "./visualizers/BeatDetection";
// import { formatTime, simulateAudioData } from "./utils";
// import { VisualizerParams, BackgroundConfig,  } from "./visualizers/base/types";
// import { AudioSource, UserVisualizerConfig, AIConfig} from "./types";

// const DEFAULT_PARAMS: VisualizerParams = {
//   // visualizerType: "spectrum",
//   // colorScheme: "cyberpunk",
//   // intensity: 75,
//   // speed: 50,
//   // cameraSpeed: 25,
//   // particleCount: 3000,
//   // bloom: true,
//   // wireframe: false,
//   // mirrorEffect: true,
//   // complexity: 6,
//   // scale: 1.0,
//   // bassBoost: false,
//   // reverb: false,
//   // frequencyRange: [20, 20000],
//   // smoothing: 0.8,
//   // beatDetection: true,
//   // gravity: false,
//   // orbitalPaths: false,
//   // asteroidBelts: false,
//   // planetaryRings: false,
//   // darkMatter: false,
//   // background: {
//   //   type: 'nebula',
//   //   colors: ['#0f0f23', '#1a1a2e', '#16213e'],
//   //   speed: 1,
//   //   complexity: 5,
//   //   opacity: 0.8,
//   //   twinkle: false
//   // }
// };

// export const LivePreviewCanvas = () => {
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [progress, setProgress] = useState<number>(0);
//   const [aiPrompt, setAiPrompt] = useState<string>("");
//   const [customConfigs, setCustomConfigs] = useState<AIConfig[]>([]);
//   const [userConfigs, setUserConfigs] = useState<UserVisualizerConfig[]>([]);
//   const [activeConfig, setActiveConfig] = useState<string>("default");
//   const [audioLevel, setAudioLevel] = useState<number>(0);
//   const [beatDetected, setBeatDetected] = useState<boolean>(false);
//   const [isGeneratingWithAI, setIsGeneratingWithAI] = useState<boolean>(false);
//   const [currentTime, setCurrentTime] = useState<number>(0);
//   const [duration, setDuration] = useState<number>(0);

//   const [params, setParams] = useState<VisualizerParams>(DEFAULT_PARAMS);
//   const [audioSource, setAudioSource] = useState<AudioSource>({
//     type: 'oscillator',
//     name: 'Default Synth'
//   });
//   const [audioFile, setAudioFile] = useState<File | null>(null);
//   const [youtubeUrl, setYoutubeUrl] = useState<string>('');
//   const [useMicrophone, setUseMicrophone] = useState<boolean>(false);

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const animationIdRef = useRef<number>(0);
//   const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(1024));
//   const timeDataRef = useRef<Float32Array>(new Float32Array(2048));

//   const visualizerEngineRef = useRef<VisualizerEngine | null>(null);
//   const audioServiceRef = useRef<AudioService | null>(null);
//   const beatDetectionRef = useRef<BeatDetectionService | null>(null);

//   // Initialize services
//   useEffect(() => {
//     if (!canvasRef.current) return;

//     visualizerEngineRef.current = new VisualizerEngine();
//     audioServiceRef.current = new AudioService();
//     beatDetectionRef.current = new BeatDetectionService();

//     visualizerEngineRef.current.initialize(canvasRef.current);
//     visualizerEngineRef.current.createVisualizer(params);

//     const handleResize = () => {
//       if (!canvasRef.current || !visualizerEngineRef.current) return;
//       visualizerEngineRef.current.resize(
//         canvasRef.current.clientWidth,
//         canvasRef.current.clientHeight
//       );
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//       visualizerEngineRef.current?.dispose();
//       audioServiceRef.current?.cleanup();
//     };
//   }, []);

//   // Audio analysis
//   useEffect(() => {
//     if (!isPlaying || !audioServiceRef.current) return;

//     const analyzeAudio = (): void => {
//       const analyser = audioServiceRef.current?.getAnalyser();
//       if (!analyser) return;

//       const frequencyData = new Uint8Array(analyser.frequencyBinCount);
//       analyser.getByteFrequencyData(frequencyData);
//       frequencyDataRef.current = frequencyData;

//       const timeData = new Float32Array(analyser.frequencyBinCount);
//       analyser.getFloatTimeDomainData(timeData);
//       timeDataRef.current = timeData;

//       const rms = Math.sqrt(timeData.reduce((sum, value) => sum + value * value, 0) / timeData.length);
//       setAudioLevel(rms * 100);

//       if (params.beatDetection && beatDetectionRef.current) {
//         const beat = beatDetectionRef.current.detectBeat(rms);
//         setBeatDetected(beat);
//         if (beat) {
//           setTimeout(() => setBeatDetected(false), 100);
//         }
//       }

//       animationIdRef.current = requestAnimationFrame(analyzeAudio);
//     };

//     analyzeAudio();

//     return () => {
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//     };
//   }, [isPlaying, params.beatDetection]);

//   // Handle audio source changes
//   useEffect(() => {
//     if (isPlaying) {
//       setupAudio();
//     }
//   }, [audioSource, audioFile, youtubeUrl, useMicrophone]);

//   const setupAudio = async (): Promise<void> => {
//     try {
//       await audioServiceRef.current?.setupAudio(audioSource, audioFile, youtubeUrl, params);
//     } catch (error) {
//       console.error('Audio setup failed:', error);
//       // Start simulation if real audio fails
//       startAudioSimulation();
//     }
//   };

//   const startAudioSimulation = (): (() => void) => {
//     const interval = setInterval(() => {
//       frequencyDataRef.current = simulateAudioData();
//     }, 16);

//     return () => clearInterval(interval);
//   };

//   const handlePlayPause = async (): Promise<void> => {
//     if (isPlaying) {
//       await audioServiceRef.current?.suspend();
//       setIsPlaying(false);
//     } else {
//       if (!audioServiceRef.current?.getAnalyser()) {
//         await setupAudio();
//       } else {
//         await audioServiceRef.current?.resume();
//       }
//       setIsPlaying(true);
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
//     const file = event.target.files?.[0];
//     if (file && file.type.startsWith('audio/')) {
//       setAudioFile(file);
//       setAudioSource({
//         type: 'file',
//         name: file.name
//       });
//     }
//   };

//   const handleYouTubeUrl = (): void => {
//     if (youtubeUrl) {
//       setAudioSource({
//         type: 'youtube',
//         url: youtubeUrl,
//         name: 'YouTube Audio'
//       });
//     }
//   };

//   const handleMicrophoneToggle = async (): Promise<void> => {
//     if (useMicrophone) {
//       setUseMicrophone(false);
//       setAudioSource({
//         type: 'oscillator',
//         name: 'Default Synth'
//       });
//     } else {
//       try {
//         await navigator.mediaDevices.getUserMedia({ audio: true });
//         setUseMicrophone(true);
//         setAudioSource({
//           type: 'microphone',
//           name: 'Microphone'
//         });
//       } catch (error) {
//         console.error('Microphone access denied:', error);
//       }
//     }
//   };

//   const generateAIConfigWithOpenAI = async (): Promise<void> => {
//     if (!aiPrompt.trim()) return;
    
//     setIsGeneratingWithAI(true);
//     try {
//       const newConfig = await AdvancedAIVisualizerGenerator.generateFromPromptWithAI(aiPrompt);
      
//       const userConfig: UserVisualizerConfig = {
//         id: Math.random().toString(36).substr(2, 9),
//         name: newConfig.name || aiPrompt,
//         config: newConfig,
//         createdAt: new Date(),
//         createdBy: 'current-user',
//         likes: 0,
//         tags: AdvancedAIVisualizerGenerator.extractTags(aiPrompt)
//       };

//       setUserConfigs(prev => [...prev, userConfig]);
//       setCustomConfigs(prev => [...prev, newConfig]);
//       setActiveConfig(userConfig.id);
//       setParams(prev => ({ ...prev, ...newConfig }));
      
//       setAiPrompt('');
//     } catch (error) {
//       console.error('AI generation failed:', error);
//       generateAIConfig();
//     } finally {
//       setIsGeneratingWithAI(false);
//     }
//   };

//   const generateAIConfig = (): void => {
//     if (!aiPrompt.trim()) return;
    
//     const newConfig = AdvancedAIVisualizerGenerator.generateFromPrompt(aiPrompt);
//     setCustomConfigs(prev => [...prev, newConfig]);
//     setActiveConfig(newConfig.name);
//     setParams(prev => ({ ...prev, ...newConfig }));
//     setAiPrompt('');
//   };

//   const loadConfig = (configName: string): void => {
//     const config = customConfigs.find((c) => c.name === configName);
//     if (config) {
//       setParams((prev) => ({ ...prev, ...config }));
//       setActiveConfig(configName);
//     }
//   };

//   const deleteConfig = (configName: string): void => {
//     setCustomConfigs((prev) => prev.filter((c) => c.name !== configName));
//     setUserConfigs(prev => prev.filter(c => c.config.name !== configName));
//     if (activeConfig === configName) {
//       setActiveConfig("default");
//     }
//   };

//   // Update visualizer when params change
//   useEffect(() => {
//     visualizerEngineRef.current?.createVisualizer(params);
//   }, [params.visualizerType, params.particleCount, params.wireframe, params.colorScheme, params.complexity]);

//   // Main animation loop - UPDATED FOR NEW ENGINE
//   useEffect(() => {
//     if (!isPlaying || !visualizerEngineRef.current) return;

//     const animate = (): void => {
//       animationIdRef.current = requestAnimationFrame(animate);
//       const frequencyData = frequencyDataRef.current;
//       const time = Date.now() * 0.001;

//       // Use the unified animate method from the new engine
//       visualizerEngineRef.current?.animate(frequencyData, time, params, beatDetected);
//     };

//     animate();

//     return () => {
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//     };
//   }, [isPlaying, params, beatDetected]);

//   // Progress simulation
//   useEffect(() => {
//     if (!isPlaying) return;
//     const interval = setInterval(() => {
//       setProgress((prev) => (prev >= 100 ? 0 : prev + 0.3));
//     }, 100);
//     return () => clearInterval(interval);
//   }, [isPlaying]);

//   // Update background when background config changes
//   const updateBackground = (background: Partial<BackgroundConfig>) => {
//     setParams(prev => ({
//       ...prev,
//       background: { ...prev.background, ...background }
//     }));
//   };

//   return (
//     <div className="h-full flex flex-col bg-slate-900/50">
//       <div className="flex-1 relative group">
//         <canvas
//           ref={canvasRef}
//           className="w-full h-full"
//         />

//         {beatDetected && (
//           <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
//         )}

//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

//         {/* Enhanced AI Configuration Panel */}
//         <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="flex-1 flex gap-2">
//             <input
//               type="text"
//               value={aiPrompt}
//               onChange={(e) => setAiPrompt(e.target.value)}
//               placeholder="Describe your visualizer (e.g., 'energetic cyberpunk dance party')"
//               className="flex-1 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400"
//               onKeyPress={(e) => e.key === "Enter" && generateAIConfigWithOpenAI()}
//               disabled={isGeneratingWithAI}
//             />
//             <Button
//               variant="primary"
//               size="lg"
//               icon={isGeneratingWithAI ? <Sparkles className="animate-spin" size={18} /> : <Wand2 size={18} />}
//               onClick={generateAIConfigWithOpenAI}
//               className="px-6"
//               disabled={isGeneratingWithAI}
//             >
//               {isGeneratingWithAI ? "Generating..." : "AI Generate"}
//             </Button>
//           </div>

//           <select
//             value={params.visualizerType}
//             onChange={(e) =>
//               setParams((p) => ({
//                 ...p,
//                 visualizerType: e.target.value as VisualizerParams["visualizerType"],
//               }))
//             }
//             className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
//           >
//             <option value="spectrum">Frequency Spectrum</option>
//             <option value="orbital">Orbital System</option>
//             <option value="solarSystem">Solar System</option>
//             <option value="galaxy">Galaxy</option>
//             <option value="blackHole">Black Hole</option>
//           </select>

//           <select
//             value={params.background?.type || 'nebula'}
//             onChange={(e) => updateBackground({ type: e.target.value as BackgroundConfig['type'] })}
//             className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white"
//           >
//             <option value="nebula">Nebula BG</option>
//             <option value="particles">Particles BG</option>
//             <option value="grid">Grid BG</option>
//             <option value="abstract">Abstract BG</option>
//           </select>
//         </div>

//         {/* Audio Source Controls */}
//         <div className="absolute top-20 left-4 right-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="flex-1 flex gap-2">
//             {/* File Upload */}
//             <label className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white cursor-pointer hover:bg-slate-700/90 transition-colors">
//               <Upload size={16} />
//               <span>Upload Audio</span>
//               <input
//                 type="file"
//                 accept="audio/*"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//             </label>

//             {/* YouTube URL */}
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={youtubeUrl}
//                 onChange={(e) => setYoutubeUrl(e.target.value)}
//                 placeholder="YouTube URL"
//                 className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400"
//               />
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={handleYouTubeUrl}
//               >
//                 Load
//               </Button>
//             </div>

//             {/* Microphone */}
//             <Button
//               variant={useMicrophone ? "primary" : "secondary"}
//               size="sm"
//               icon={<Volume2 size={16} />}
//               onClick={handleMicrophoneToggle}
//             >
//               {useMicrophone ? "Mic On" : "Mic Off"}
//             </Button>

//             {/* Audio Source Display */}
//             <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-300">
//               <Music size={16} className="inline mr-2" />
//               {audioSource.name}
//             </div>
//           </div>
//         </div>

//         {/* Audio Level Meter */}
//         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
//             <Volume2 size={16} className="text-slate-300" />
//             <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-100"
//                 style={{ width: `${audioLevel}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* User Configurations Gallery */}
//         {userConfigs.length > 0 && (
//           <div className="absolute top-32 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
//             <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl p-4">
//               <h3 className="text-sm font-semibold text-slate-300 mb-3">Community Visualizers</h3>
//               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
//                 {userConfigs.map((config) => (
//                   <div
//                     key={config.id}
//                     className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-3 py-2 hover:bg-slate-600/50 transition-colors"
//                   >
//                     <button
//                       onClick={() => {
//                         setParams(prev => ({ ...prev, ...config.config }));
//                         setActiveConfig(config.id);
//                       }}
//                       className={`text-xs px-2 py-1 rounded transition-all ${
//                         activeConfig === config.id
//                           ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
//                           : "text-slate-300 hover:bg-slate-600"
//                       }`}
//                     >
//                       {config.name}
//                     </button>
//                     <span className="text-xs text-slate-400 ml-1">♥ {config.likes}</span>
//                     <button
//                       onClick={() => deleteConfig(config.config.name)}
//                       className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
//                     >
//                       <Trash2 size={10} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Enhanced Control Bar */}
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl px-6 py-3">
//           <Button
//             variant="secondary"
//             size="lg"
//             icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             onClick={handlePlayPause}
//             className="px-6"
//           >
//             {isPlaying ? "Pause" : "Play"}
//           </Button>

//           <Button
//             variant={isRecording ? "danger" : "secondary"}
//             size="lg"
//             icon={<Square size={20} />}
//             onClick={() => setIsRecording(!isRecording)}
//             className="px-6"
//           >
//             {isRecording ? "Stop" : "Record"}
//           </Button>

//           <Button variant="ghost" size="lg" icon={<Maximize2 size={20} />}>
//             Fullscreen
//           </Button>

//           <Button variant="ghost" size="lg" icon={<Settings size={20} />}>
//             Settings
//           </Button>
//         </div>

//         {isRecording && (
//           <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 rounded-xl">
//             <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
//             <span className="text-sm text-rose-400 font-medium">Recording</span>
//           </div>
//         )}

//         {/* Visualizer Type Badge */}
//         <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl px-3 py-2">
//             <span className="text-sm text-slate-300 capitalize">
//               {params.visualizerType} Visualizer
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Control Panel */}
//       <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-6 space-y-6">
//         <div className="w-full">
//           <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
//             <span>{formatTime(currentTime)}</span>
//             <span>{formatTime(duration)}</span>
//           </div>
//           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-200"
//               style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : progress}%` }}
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
//           <Slider
//             label="Intensity"
//             value={params.intensity}
//             onChange={(v: number) => setParams((p) => ({ ...p, intensity: v }))}
//           />
//           <Slider
//             label="Speed"
//             value={params.speed}
//             onChange={(v: number) => setParams((p) => ({ ...p, speed: v }))}
//           />
//           <Slider
//             label="Camera Speed"
//             value={params.cameraSpeed || 25}
//             onChange={(v: number) => setParams((p) => ({ ...p, cameraSpeed: v }))}
//           />
//           <Slider
//             label="Particles"
//             value={params.particleCount}
//             min={100}
//             max={10000}
//             onChange={(v: number) => setParams((p) => ({ ...p, particleCount: v }))}
//           />
//           <Slider
//             label="Complexity"
//             value={params.complexity}
//             onChange={(v: number) => setParams((p) => ({ ...p, complexity: v }))}
//           />
//           <Slider
//             label="Scale"
//             value={params.scale * 100}
//             onChange={(v: number) => setParams((p) => ({ ...p, scale: v / 100 }))}
//           />
//           <Slider
//             label="Smoothing"
//             value={params.smoothing * 100}
//             onChange={(v: number) => setParams((p) => ({ ...p, smoothing: v / 100 }))}
//           />
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-6">
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.wireframe}
//                 onChange={(e) => setParams((p) => ({ ...p, wireframe: e.target.checked }))}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Wireframe</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.bloom}
//                 onChange={(e) => setParams((p) => ({ ...p, bloom: e.target.checked }))}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Bloom Effect</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.mirrorEffect}
//                 onChange={(e) => setParams((p) => ({ ...p, mirrorEffect: e.target.checked }))}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Mirror Effect</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.bassBoost}
//                 onChange={(e) => setParams((p) => ({ ...p, bassBoost: e.target.checked }))}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Bass Boost</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.beatDetection}
//                 onChange={(e) => setParams((p) => ({ ...p, beatDetection: e.target.checked }))}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Beat Detection</span>
//             </label>
//             <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={params.background?.twinkle || false}
//                 onChange={(e) => updateBackground({ twinkle: e.target.checked })}
//                 className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500"
//               />
//               <span>Twinkle Stars</span>
//             </label>
//           </div>

//           <div className="flex items-center gap-3">
//             <Button variant="secondary" size="sm" icon={<Sparkles size={16} />}>
//               Presets
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