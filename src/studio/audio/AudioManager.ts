import { BeatInfo } from '../types/visualizer';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private dataArray: Uint8Array | null = null;
  private beatCutoff: number = 0;
  private beatTime: number = 0;
  private isInitialized: boolean = false;
  private defaultSource: AudioBufferSourceNode | null = null;
  private isDefaultAudioPlaying: boolean = false;
  private progressCallbacks: ((currentTime: number, duration: number) => void)[] = [];

  // Frequency bands for detailed analysis
  private frequencyBands = {
    bass: [20, 250],
    lowMid: [250, 500],
    mid: [500, 2000],
    highMid: [2000, 6000],
    treble: [6000, 20000],
  };

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.7;

      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";

      this.source = this.audioContext.createMediaElementSource(
        this.audioElement
      );
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isInitialized = true;

      console.log("Audio manager initialized successfully");
    } catch (error) {
      console.error("Audio setup failed:", error);
      this.isInitialized = false;
    }
  }

  async loadAudioFile(file: File): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop any currently playing audio
    this.pause();
    this.isDefaultAudioPlaying = false;

    // 🔧 FIX: Ensure audioElement always exists
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";

      // Reconnect it to the analyser
      if (this.audioContext && this.analyser) {
        this.source = this.audioContext.createMediaElementSource(
          this.audioElement
        );
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
    }

    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      this.audioElement!.src = url;

      // Set up progress tracking for uploaded audio
      this.audioElement!.ontimeupdate = () => {
        this.notifyProgressCallbacks();
      };

      this.audioElement!.onended = () => {
        this.isDefaultAudioPlaying = false;
        this.notifyProgressCallbacks();
      };

      this.audioElement!.oncanplaythrough = () => {
        console.log("✅ Audio can play through:", file.name);
        resolve(true);
      };

      this.audioElement!.onerror = (error) => {
        console.error("❌ Error loading audio file:", error);
        URL.revokeObjectURL(url);
        resolve(false);
      };
    });
  }

  // Load default demo audio (sine wave generated programmatically)
  async loadDefaultAudio(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Stop any currently playing audio
      this.pause();

      // Generate a simple sine wave as default audio
      const duration = 10; // seconds
      const sampleRate = 44100;
      const numberOfSamples = duration * sampleRate;
      const audioBuffer = this.audioContext!.createBuffer(
        2,
        numberOfSamples,
        sampleRate
      );

      // Fill the buffer with a sine wave
      for (let channel = 0; channel < 2; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < numberOfSamples; i++) {
          // Create an interesting pattern with multiple frequencies
          const t = i / sampleRate;
          const freq1 = 220 + Math.sin(t * 0.5) * 110; // A3 to A4
          const freq2 = 440 + Math.sin(t * 0.3) * 220; // A4 to A5
          channelData[i] =
            Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
            Math.sin(2 * Math.PI * freq2 * t) * 0.2;
        }
      }

      // Store for later use
      this.defaultSource = this.audioContext!.createBufferSource();
      this.defaultSource.buffer = audioBuffer;
      this.defaultSource.connect(this.analyser!);
      this.defaultSource.loop = true;

      // Set up progress tracking for default audio
      this.defaultSource.onended = () => {
        this.isDefaultAudioPlaying = false;
        this.notifyProgressCallbacks();
      };

      console.log("Default audio loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading default audio:", error);
      return false;
    }
  }

  async play(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }

    if (this.audioElement && this.audioElement.src) {
      // User uploaded audio
      try {
        await this.audioElement.play();
        // Start progress tracking
        this.startProgressTracking();
      } catch (error) {
        console.error("Play failed:", error);
        throw error;
      }
    } else if (this.defaultSource) {
      // Default audio
      try {
        this.defaultSource.start();
        this.isDefaultAudioPlaying = true;
        // Start progress tracking for default audio
        this.startProgressTracking();
      } catch (error) {
        console.error("Default audio play failed:", error);
        // Recreate default audio if it can't be started
        await this.loadDefaultAudio();
        this.defaultSource!.start();
        this.isDefaultAudioPlaying = true;
        this.startProgressTracking();
      }
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.defaultSource && this.isDefaultAudioPlaying) {
      try {
        this.defaultSource.stop();
        this.isDefaultAudioPlaying = false;
      } catch (error) {
        console.warn("Error stopping default source:", error);
      }
      // Recreate for next play
      this.loadDefaultAudio();
    }
    this.stopProgressTracking();
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(1024);
    }
    
    // Create a new Uint8Array to avoid the ArrayBuffer type issues
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);
    return frequencyData;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(1024);
    }
    
    // Create a new Uint8Array to avoid the ArrayBuffer type issues
    const timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  }

  // Enhanced beat detection with frequency band analysis
  detectBeat(frequencyData: Uint8Array): BeatInfo {
    const bandStrengths: BeatInfo['bandStrengths'] = {
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0
    };
    
    let totalEnergy = 0;

    // Calculate energy for each frequency band
    Object.entries(this.frequencyBands).forEach(([band, [low, high]]) => {
      const lowIndex = Math.floor((low / 20000) * frequencyData.length);
      const highIndex = Math.floor((high / 20000) * frequencyData.length);

      let energy = 0;
      const count = highIndex - lowIndex;

      if (count > 0) {
        for (let i = lowIndex; i < highIndex; i++) {
          energy += frequencyData[i];
        }
        energy /= count;
      }

      bandStrengths[band as keyof BeatInfo['bandStrengths']] = energy / 255;
      totalEnergy += energy;
    });

    const averageEnergy = totalEnergy / 5 / 255;
    const currentTime = Date.now();

    // Dynamic threshold based on recent history
    const isBeat =
      averageEnergy > this.beatCutoff && currentTime - this.beatTime > 200;

    if (isBeat) {
      this.beatTime = currentTime;
      this.beatCutoff = averageEnergy * 1.3;
    } else {
      this.beatCutoff *= 0.95; // Decay threshold
    }

    return {
      isBeat,
      strength: averageEnergy,
      bandStrengths,
    };
  }

  getBassLevel(frequencyData: Uint8Array): number {
    const [low, high] = this.frequencyBands.bass;
    const lowIndex = Math.floor((low / 20000) * frequencyData.length);
    const highIndex = Math.floor((high / 20000) * frequencyData.length);

    let bassEnergy = 0;
    const count = highIndex - lowIndex;

    if (count > 0) {
      for (let i = lowIndex; i < highIndex; i++) {
        bassEnergy += frequencyData[i];
      }
      bassEnergy /= count;
    }

    return bassEnergy / 255 || 0;
  }

  isPlaying(): boolean {
    if (this.audioElement) {
      return !this.audioElement.paused && !this.audioElement.ended;
    }
    return this.isDefaultAudioPlaying;
  }

  getDuration(): number {
    if (this.audioElement && this.audioElement.duration) {
      return this.audioElement.duration;
    }
    return this.defaultSource?.buffer?.duration || 10; // Default audio is 10 seconds
  }

  getCurrentTime(): number {
    if (this.audioElement) {
      return this.audioElement.currentTime || 0;
    }
    return this.defaultSource?.context?.currentTime || 0;
  }

  onTimeUpdate(callback: (currentTime: number, duration: number) => void) {
    this.progressCallbacks.push(callback);
  }

  offTimeUpdate(callback: (currentTime: number, duration: number) => void) {
    this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
  }

  private notifyProgressCallbacks() {
    const currentTime = this.getCurrentTime();
    const duration = this.getDuration();
    this.progressCallbacks.forEach(callback => {
      try {
        callback(currentTime, duration);
      } catch (error) {
        console.error("Progress callback error:", error);
      }
    });
  }

  private progressInterval: number | null = null;

  private startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = window.setInterval(() => {
      this.notifyProgressCallbacks();
    }, 100); // Update every 100ms
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // 🎚️ Seek to specific time (used by progress bar drag)
  seekTo(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
    // Note: Seeking not supported for default audio
  }

  cleanup() {
    try {
      this.stopProgressTracking();
      this.progressCallbacks = [];

      // Stop and clear uploaded audio
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
        this.audioElement.load(); // Reset element
      }

      // Stop generated default audio safely
      if (this.defaultSource) {
        try {
          this.defaultSource.stop();
        } catch (stopError) {
          console.warn("⚠️ Default source stop skipped:", stopError);
        }
        this.defaultSource = null;
      }

      this.isDefaultAudioPlaying = false;

      // Close context
      if (this.audioContext) {
        this.audioContext.close().catch(console.error);
        this.audioContext = null;
      }

      this.isInitialized = false;
      console.log("🧹 AudioManager cleaned up safely");
    } catch (error) {
      console.error("❌ Error during AudioManager cleanup:", error);
    }
  }
}