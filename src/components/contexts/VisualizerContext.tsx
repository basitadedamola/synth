// contexts/VisualizerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { VisualizerParams, BeatInfo } from "../../studio/types/visualizer";
import {
  VisualElement,
  Customization,
  ParticleCustomization,
  LightCustomization,
  GridCustomization,
  BackgroundCustomization,
  ShapeCustomization,
  WaveCustomization,
} from "../../studio/types/visualizer";

interface VisualizerContextType {
  params: VisualizerParams;
  setParams: (params: VisualizerParams | ((prev: VisualizerParams) => VisualizerParams)) => void;
  visualElements: VisualElement[];
  setVisualElements: (elements: VisualElement[] | ((prev: VisualElement[]) => VisualElement[])) => void;
  updateElement: (id: string, updates: Partial<VisualElement>) => void;
  updateElementCustomization: (
    id: string,
    updates: Partial<Customization>
  ) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  audioData: {
    frequencyData: Uint8Array;
    timeData: Float32Array;
    beatInfo: BeatInfo;
    audioLevel: number;
  };
  setAudioData: (data: VisualizerContextType["audioData"]) => void;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(
  undefined
);

// Default configurations for each element type
export const defaultCustomizations = {
  background: {
    type: 'background' as const,
    color: '#0a0a0a',
    gradient: true,
    gradientStart: '#0a0a0a',
    gradientEnd: '#1a1a2e',
    opacity: 1,
  },
  
  particle: {
    type: 'particle' as const,
    color: '#00ff88',
    size: 0.1,
    opacity: 0.8,
    speed: 1.0,
    intensity: 1,
    count: 3000,
    responseTo: 'bass' as const,
  },
  
  light: {
    type: 'light' as const,
    color: '#ffffff',
    opacity: 1,
    intensity: 1.0,
    position: [5, 5, 5] as [number, number, number],
    responseTo: 'beat' as const,
  },
  
  grid: {
    type: 'grid' as const,
    color: '#00ff88',
    opacity: 0.6,
    intensity: 1,
    size: 20,
    divisions: 30,
    responseTo: 'mid' as const,
  },
  
  shape: {
    type: 'shape' as const,
    color: '#ff0088',
    opacity: 0.8,
    intensity: 1,
    geometry: 'cube' as const,
    size: 1,
    rotationSpeed: 1,
    responseTo: 'treble' as const,
  },
  
  wave: {
    type: 'wave' as const,
    color: '#0088ff',
    opacity: 0.7,
    intensity: 1,
    amplitude: 2,
    frequency: 1,
    speed: 1,
    points: 50,
    responseTo: 'overall' as const,
  }
};

export const VisualizerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

  const [visualElements, setVisualElements] = useState<VisualElement[]>([
    {
      id: "background",
      type: "background",
      name: "Background",
      visible: true,
      customization:
        defaultCustomizations.background as BackgroundCustomization,
    },
    {
      id: "main-particles",
      type: "particle",
      name: "Main Particles",
      visible: true,
      customization: defaultCustomizations.particle as ParticleCustomization,
    },
    {
      id: "grid-lines",
      type: "grid",
      name: "Grid Lines",
      visible: true,
      customization: defaultCustomizations.grid as GridCustomization,
    },
    {
      id: "ambient-light",
      type: "light",
      name: "Ambient Light",
      visible: true,
      customization: defaultCustomizations.light as LightCustomization,
    },
    {
      id: "directional-light",
      type: "light",
      name: "Directional Light",
      visible: true,
      customization: {
        ...defaultCustomizations.light,
        position: [5, 5, 5],
      } as LightCustomization,
    },
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<
    VisualizerContextType["audioData"]
  >({
    frequencyData: new Uint8Array(1024),
    timeData: new Float32Array(2048),
    beatInfo: { isBeat: false, strength: 0, bandStrengths: {} },
    audioLevel: 0,
  });

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    setVisualElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const updateElementCustomization = (
    id: string,
    updates: Partial<Customization>
  ) => {
    setVisualElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              customization: { ...el.customization, ...updates },
            }
          : el
      )
    );
  };

  return (
    <VisualizerContext.Provider
      value={{
        params,
        setParams,
        visualElements,
        setVisualElements,
        updateElement,
        updateElementCustomization,
        selectedElement,
        setSelectedElement,
        audioData,
        setAudioData,
      }}
    >
      {children}
    </VisualizerContext.Provider>
  );
};

export const useVisualizer = () => {
  const context = useContext(VisualizerContext);
  if (context === undefined) {
    throw new Error("useVisualizer must be used within a VisualizerProvider");
  }
  return context;
};
